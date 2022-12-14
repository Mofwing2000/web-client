import { collection, doc, getDoc, query, runTransaction, setDoc } from 'firebase/firestore';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Cart, CartState } from '../../models/cart';
import { Product, ProductState } from '../../models/product';
import { clearCartAsync, fetchCartAsync } from '../../store/cart/cart.action';
import { selectCart } from '../../store/cart/cart.reducer';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { Order, OrderedItem, OrderState, PaymentMethod, ShippingClass, ShippingType } from '../../models/order';
import { toast } from 'react-toastify';
import { FirebaseError } from '@firebase/util';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { Link } from 'react-router-dom';
import { UserState } from '../../models/user';
import { selectUser } from '../../store/user/user.reducer';
import { useTranslation } from 'react-i18next';

import './checkout.scss';

const Checkout = () => {
    const { user } = useAppSelector<UserState>(selectUser);
    const { cart, isCartLoading } = useAppSelector<CartState>(selectCart);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const [shippingType, setShippingType] = useState<ShippingType>({
        shippingClass: ShippingClass.ECONOMY,
        price: 5,
    });
    const [shippingAddress, setShippingAddress] = useState<string>(user!.address);
    const [note, setNote] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
    const dispatch = useAppDispatch();
    const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
    const { t } = useTranslation(['common', 'order', 'user']);

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
                    toast.error(t('common:limitQuantityReached'));
                    setIsCreatingOrder(false);
                    return;
                } else {
                    if (user && cart && subTotal) {
                        const docRef = doc(collection(db, 'order'));
                        const order: Order = {
                            id: docRef.id,
                            userId: user.id,
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
                            toast.success(t('common:orderSucceed'));
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
        if (!cart) dispatch(fetchCartAsync.request());
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
                                        <h6 className="checkout__title">{t('common:billDetail')}</h6>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        {t('user:firstName')}
                                                        <span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={user?.firstName}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        {t('user:lastName')}
                                                        <span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={user?.lastName}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="checkout__input">
                                                    <p className="checkout__input__text">
                                                        {t('user:phoneNumber')}
                                                        <span className="required">*</span>
                                                    </p>
                                                    <input
                                                        className="form-input"
                                                        type="text"
                                                        value={user?.phoneNumber}
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
                                                        value={user?.email}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                {t('user:address')}
                                                <span className="required">*</span>
                                            </p>

                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Apartment, suite, unite ect (optinal)"
                                                defaultValue={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                onBlur={(e) => {
                                                    if (e.target.value.trim() === '')
                                                        if (user) e.target.value = user.address;
                                                }}
                                            />
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                {t('order:shipping')}
                                                <span className="required">*</span>
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
                                                        {t('order:economy')}
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
                                                        {t('order:firstClass')}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">
                                                {t('order:payment')}
                                                <span className="required">*</span>
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
                                                    {t('order:bankTransfer')}
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
                                                        {t('order:accountNumber')}: 15000206082220
                                                    </p>
                                                    <p className="text-center fw-bold mb-5">
                                                        {t('order:cardOwner')}: VU DUC MINH
                                                    </p>
                                                    <p className="mb-0">
                                                        {t('order:transferContent')}: OrderId_Full name.
                                                    </p>
                                                    <p>{t('common:autoHandleMessage')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="checkout__input">
                                            <p className="checkout__input__text">{t('order:note')}</p>
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
                                            <h4 className="order__title">{t('order:yourOrder')}</h4>
                                            <div className="checkout__order__products">
                                                {t('product:product')} <span>{t('order:total')}</span>
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
                                                                        {t('order:variant')}: {item.size}, {item.color}
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
                                                    {t('order:subtotal')}{' '}
                                                    <span className="checkout__total__all__price">${subTotal}</span>
                                                </li>
                                                <li>
                                                    {t('order:shipping')}{' '}
                                                    <span className="checkout__total__all__price">
                                                        ${shippingType.price}
                                                    </span>
                                                </li>
                                                <li>
                                                    {t('order:total')}{' '}
                                                    <span className="checkout__total__all__price">
                                                        ${subTotal && subTotal + shippingType.price}
                                                    </span>
                                                </li>
                                            </ul>
                                            <button className="site-btn" onClick={handleOrder} disabled={isLoading}>
                                                {t('order:placeOrder')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="checkout--empty">
                            <h3 className="mb-5">{t('common:cartNoItem')}</h3>
                            <div className="checkout--empty__navigate">
                                <Link to="/top">{t('common:shopNow')}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(Checkout);
