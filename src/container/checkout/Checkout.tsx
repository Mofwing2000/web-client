import { addDoc, collection, doc, getDoc, query, runTransaction, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import AuthState from '../../models/auth';
import { Cart, CartState } from '../../models/cart';
import { Bottom, Product, ProductState, Top } from '../../models/product';
import { clearCartAsync, fetchCartAsync } from '../../store/cart/cart.action';
import { selectCart } from '../../store/cart/cart.reducer';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { selectAuth } from '../../store/root-reducer';
import { Order, OrderedItem, OrderState, PaymentMethod, ShippingClass, ShippingType } from '../../models/order';
import './checkout.scss';
import cuid from 'cuid';
import { toast } from 'react-toastify';
import { FirebaseError } from '@firebase/util';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { Link } from 'react-router-dom';

const Checkout = () => {
    const { currentUser } = useAppSelector<AuthState>(selectAuth);
    const { cart, isCartLoading } = useAppSelector<CartState>(selectCart);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const [shippingType, setShippingType] = useState<ShippingType>({
        shippingClass: ShippingClass.ECONOMY,
        price: 5,
    });
    const [shippingAddress, setShippingAddress] = useState<string>(currentUser!.address);
    const [note, setNote] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const dispatch = useAppDispatch();
    const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
    let isLoading = useMemo(() => {
        return isCartLoading || isProductLoading || isCreatingOrder;
    }, [isCartLoading, isProductLoading, isCreatingOrder]);

    const fetchProductQuery = useMemo(() => {
        if (cart) return query(collection(db, 'product'));
    }, [cart]);

    const cartProducts = useMemo(() => {
        if (cart && products)
            return products.filter((product) => cart.cartItems.map((item) => item.id).includes(product.id));
    }, [cart, products]);

    const cartItemQuantity = useMemo(() => {
        let tempLimit: any = {};
        if (cart) {
            cart.cartItems.forEach((item) => {
                if (typeof tempLimit[item.id] === 'undefined') tempLimit[item.id] = item.quantity;
                else tempLimit[item.id] += item.quantity;
            });
            return tempLimit;
        }
    }, [cartProducts]);

    const subTotal = useMemo(
        () => cartProducts?.reduce((total, current) => (total += current.price * cartItemQuantity[current.id]), 0),
        [cartProducts, cartItemQuantity],
    );

    const isLimit = async (id: string) => {
        try {
            const docSnap = await getDoc(doc(db, 'product', id));
            if (docSnap.exists()) {
                console.log((docSnap.data() as Product).quantity, cartItemQuantity[(docSnap.data() as Product).id]);
                if ((docSnap.data() as Product).quantity < cartItemQuantity[(docSnap.data() as Product).id])
                    return true;
                else return false;
            }
        } catch (error) {
            if (error instanceof FirebaseError) toast.error(error.message);
        }
    };

    const updateQuantity = async (id: string) => {
        const docRef = doc(db, 'product', id);
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(docRef);
                if (sfDoc.exists()) {
                    const newQuantity = sfDoc.data().quantity - cartItemQuantity[id];
                    transaction.update(docRef, { quantity: newQuantity });
                }
            });
        } catch (error) {
            if (error instanceof FirebaseError) toast.error(error.message);
        }
    };

    const handleOrder = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsCreatingOrder(true);
        e.preventDefault();
        if (fetchProductQuery) {
            if (cartProducts) {
                const checkLimit = async () => {
                    return Promise.all(cartProducts.map((item) => isLimit(item.id)));
                };
                const checkLimitArray = await checkLimit();
                if (checkLimitArray.find((item) => item === true)) {
                    toast.error('Limit quantity reached');
                    setIsCreatingOrder(false);
                    return;
                } else {
                    if (currentUser && cart && subTotal) {
                        const docRef = doc(collection(db, 'order'));
                        const order: Order = {
                            id: docRef.id,
                            userId: currentUser.id,
                            orderedProducts: cart.cartItems as OrderedItem[],
                            shippingAddress,
                            shippingType,
                            orderState: OrderState.PENDING,
                            note,
                            paymentMethod,
                            orderDate: new Date(Date.now()),
                            totalAmount: subTotal && subTotal + shippingType.price,
                        };
                        try {
                            await setDoc(docRef, { ...order });
                            if (cartProducts) {
                                const update = async () => {
                                    return Promise.all(cartProducts.map((item) => updateQuantity(item.id)));
                                };
                                await update();
                            }
                            dispatch(clearCartAsync.request());
                            toast.success('Order succeed');
                            setIsCreatingOrder(false);
                        } catch (error) {
                            if (error instanceof FirebaseError) toast.error(error.message);
                            setIsCreatingOrder(false);
                        }
                    }
                }
            }
        }
    };

    useEffect(() => {
        dispatch(fetchCartAsync.request());
    }, []);

    useEffect(() => {
        if (fetchProductQuery) dispatch(fetchProductsAsync.request(fetchProductQuery));

        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);

    return (
        <>
            <div className="checkout spad">
                <div className="container">
                    {cart?.cartItems.length !== 0 ? (
                        <div className="checkout__form">
                            <form>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <h6 className="checkout__title">Billing Details</h6>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        Fist Name<span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={currentUser?.firstName}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        Last Name<span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={currentUser?.lastName}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        Phone<span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={currentUser?.phoneNumber}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        Email<span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={currentUser?.email}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                Address<span className="required">*</span>
                                            </p>

                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Apartment, suite, unite ect (optinal)"
                                                defaultValue={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                onBlur={(e) => {
                                                    if (e.target.value.trim() === '')
                                                        if (currentUser) e.target.value = currentUser.address;
                                                }}
                                            />
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                Shipping<span className="required">*</span>
                                            </p>
                                            <div className="d-flex gap-5 mb-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="shippingType"
                                                        id="economy"
                                                        defaultChecked
                                                        onClick={() =>
                                                            setShippingType({
                                                                shippingClass: ShippingClass.ECONOMY,
                                                                price: 5,
                                                            })
                                                        }
                                                    />
                                                    <label className="form-check-label" htmlFor="economy">
                                                        Economy
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="shippingType"
                                                        id="first_class"
                                                        onClick={() =>
                                                            setShippingType({
                                                                shippingClass: ShippingClass.FIRST_CLASS,
                                                                price: 10,
                                                            })
                                                        }
                                                    />
                                                    <label className="form-check-label" htmlFor="first_class">
                                                        First-class
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                Payment<span className="required">*</span>
                                            </p>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentType"
                                                    id="cod"
                                                    defaultChecked
                                                    onClick={() => setPaymentMethod(PaymentMethod.COD)}
                                                />
                                                <label className="form-check-label" htmlFor="cod">
                                                    COD
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentType"
                                                    id="bank_transfer"
                                                    onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                                                />
                                                <label className="form-check-label" htmlFor="bank_transfer">
                                                    Bank transfer
                                                </label>
                                                <div
                                                    className={` mt-5 ${
                                                        paymentMethod === PaymentMethod.BANK_TRANSFER
                                                            ? 'd-block'
                                                            : 'd-none'
                                                    }`}
                                                >
                                                    <p className="text-center fw-bold">BANK - AGRIBANK</p>
                                                    <p className="text-center fw-bold">
                                                        Account number: 15000206082220
                                                    </p>
                                                    <p className="text-center fw-bold mb-5">Card owner: VU DUC MINH</p>
                                                    <p className="mb-0">Transfer Contents: OrderId_Full name.</p>
                                                    <p>
                                                        When transaction completed, your order will be automatically
                                                        handle by our staff.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">Order notes</p>
                                            <input
                                                className="form-input"
                                                type="text"
                                                placeholder="Notes about your order, e.g. special notes for delivery."
                                                value={note}
                                                onChange={(e) => setNote(e.target.value.trim())}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="checkout__order">
                                            <h4 className="order__title">Your order</h4>
                                            <div className="checkout__order__products">
                                                Product <span>Total</span>
                                            </div>
                                            <ul className="checkout__total__products">
                                                {cart &&
                                                    cartProducts &&
                                                    (cart as Cart).cartItems.map((item, index) => {
                                                        const cartItem = cartProducts.find(
                                                            (product) => product.id === item.id,
                                                        );
                                                        return (
                                                            <li className="checkout__total__item" key={index}>
                                                                <div className="d-flex flex-column">
                                                                    <span>
                                                                        {index + 1}. {cartItem?.name} * {item?.quantity}{' '}
                                                                    </span>
                                                                    <span>
                                                                        Variant: {item.size}, {item.color}
                                                                    </span>
                                                                </div>
                                                                <span>
                                                                    $ {cartItem && cartItem?.price * item?.quantity}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                            <ul className="checkout__total__all">
                                                <li>
                                                    Subtotal{' '}
                                                    <span className="checkout__total__all__price">${subTotal}</span>
                                                </li>
                                                <li>
                                                    Shipping{' '}
                                                    <span className="checkout__total__all__price">
                                                        ${shippingType.price}
                                                    </span>
                                                </li>
                                                <li>
                                                    Total{' '}
                                                    <span className="checkout__total__all__price">
                                                        ${subTotal && subTotal + shippingType.price}
                                                    </span>
                                                </li>
                                            </ul>
                                            <button className="site-btn" onClick={handleOrder} disabled={isLoading}>
                                                PLACE ORDER
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="checkout--empty">
                            <h3 className="mb-5">No items in cart</h3>
                            <div className="checkout--empty__navigate">
                                <Link to="/top">Shop now</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default Checkout;
