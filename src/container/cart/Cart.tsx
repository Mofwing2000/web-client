import { collection, query } from 'firebase/firestore';
import React, { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { CartItem, CartState } from '../../models/cart';
import { ProductState } from '../../models/product';
import {
    changeQuantityCartAsync,
    decreaseCartAsync,
    fetchCartAsync,
    increaseCartAsync,
    removeCartAsync,
} from '../../store/cart/cart.action';
import { selectCart } from '../../store/cart/cart.reducer';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';

import { DEFAULT_PRODUCT_PHOTO_URL as defaultProductPhoto } from '../../constants/commons';
import './cart.scss';

const CartPage = () => {
    const { cart, isCartLoading } = useAppSelector<CartState>(selectCart);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { t } = useTranslation(['common', 'order']);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isLoading = useMemo(() => {
        return isCartLoading || isProductLoading;
    }, [isCartLoading, isProductLoading]);

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

    const handleQuantityChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        cartItem: CartItem,
        oldQuantity: number,
    ) => {
        if (cartProducts && !isLoading) {
            let newQuantity: number;
            const itemInProductList = cartProducts.find((product) => product.id === cartItem.id);
            if (+e.target.value < 1) {
                newQuantity = 1;
                e.target.value = '1';
            } else if (
                itemInProductList &&
                +e.target.value > itemInProductList.quantity - cartItemQuantity[cartItem.id] + +oldQuantity
            ) {
                newQuantity = itemInProductList.quantity - cartItemQuantity[cartItem.id] + oldQuantity;
                e.target.value = newQuantity + '';
            } else newQuantity = +e.target.value;
            dispatch(changeQuantityCartAsync.request({ cartItem, newQuantity }));
        }
    };

    const listCartItems = useMemo(
        () =>
            cart &&
            cartProducts &&
            cart.cartItems.map((item, index) => {
                const cartItem = cartProducts.find((product) => product.id === item.id);
                return (
                    <tr key={index}>
                        <td className="product__cart__item col-6 d-flex align-items-center justify-content-between gap-4">
                            <div className="product__cart__item__pic d-flex align-items-center justify-content-center">
                                <img
                                    src={cartItem?.photoUrls[0]}
                                    alt=""
                                    onError={({ currentTarget }) => {
                                        if (currentTarget?.src) {
                                            currentTarget.src = defaultProductPhoto;
                                        }
                                    }}
                                    className="d-block"
                                />
                            </div>
                            <div className="product__cart__item__text w-100">
                                <h6>{cartItem?.name}</h6>
                                <p>
                                    {t('common:variant')}: {item.size}, {item.color}
                                </p>
                                <h5>${cartItem?.price}</h5>
                            </div>
                        </td>
                        <td className="quantity__item col-3">
                            <div className="quantity">
                                <div className="pro-qty-2 d-flex flex-column align-items-center mb-2">
                                    <div>
                                        <span
                                            className="quantity__edit fa fa-angle-left fs-5"
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    dispatch(decreaseCartAsync.request(item));
                                                }
                                            }}
                                        ></span>
                                        <input
                                            className={`quantity__input ${
                                                cartItem && cartItemQuantity[item.id] > cartItem.quantity
                                                    ? 'text-danger'
                                                    : ''
                                            }`}
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(e, item, item.quantity)}
                                        />
                                        <span
                                            className="quantity__edit fa fa-angle-right fs-5"
                                            onClick={() => {
                                                if (
                                                    cartItem &&
                                                    item.quantity <
                                                        cartItem.quantity - cartItemQuantity[item.id] + item.quantity
                                                )
                                                    dispatch(increaseCartAsync.request(item));
                                                else toast.error(t('common:limitQuantityReached'));
                                            }}
                                        ></span>
                                    </div>
                                </div>
                                {cartItem && cartItemQuantity[item.id] > cartItem.quantity && (
                                    <p className="text-danger">{t('common:limitQuantityReached')}</p>
                                )}
                            </div>
                        </td>
                        <td className="cart__price col-2">$ {cartItem && cartItem.price * item.quantity}</td>
                        <td className="cart__close col-1">
                            <i className="fa fa-close" onClick={() => dispatch(removeCartAsync.request(item))}></i>
                        </td>
                    </tr>
                );
            }),
        [cart, cartProducts],
    );

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
            <div className="shopping-cart container spad">
                {cart && cart.cartItems.length !== 0 ? (
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="shopping__cart__table table-responsive-xl">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="col-6">
                                                {t('order:subTotal')}
                                            </th>
                                            <th scope="col" className="col-3">
                                                {t('order:quantity')}
                                            </th>
                                            <th scope="col" className="col-2">
                                                {t('order:total')}
                                            </th>
                                            <th scope="col" className="col-1"></th>
                                        </tr>
                                    </thead>
                                    <tbody>{listCartItems}</tbody>
                                </table>
                            </div>
                            <div className="row gy-3">
                                <div className="col-md-6 px-3">
                                    <div className="cart__btn">
                                        <Link to="/top">{t('order:continueShoping')}</Link>
                                    </div>
                                </div>
                                <div className="col-md-6 text-md-end px-3">
                                    <div className="cart__btn">
                                        <button
                                            onClick={() => {
                                                if (cartProducts) {
                                                    if (
                                                        cartProducts.findIndex(
                                                            (item) => item.quantity < cartItemQuantity[item.id],
                                                        ) !== -1
                                                    ) {
                                                        toast.error(t('common:limitQuantityReached'));
                                                    } else {
                                                        navigate('/checkout');
                                                    }
                                                }
                                            }}
                                        >
                                            {' '}
                                            {t('order:checkout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="cart-page--empty">
                        <h3 className="mb-5">{t('common:noItemCart')}</h3>
                        <div className="cart__btn">
                            <Link to="/top">{t('common:shopNow')}</Link>
                        </div>
                    </div>
                )}
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(CartPage);
