import i18next from 'i18next';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '../../assets/image/logo.png';
import { DEFAULT_USER_PHOTO_URL as defaultUserPhoto } from '../../constants/commons';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { logout } from '../../store/auth/auth.action';
import { toggleDarkMode } from '../../store/dark-mode/dark-mode.action';
import { selectAuth } from '../../store/root-reducer';
import './header.scss';
import { selectDarkMode } from '../../store/dark-mode/dark-mode.reducer';
import { DisplayModeState } from '../../models/display-mode';
import { BottomCategory, TopCategory } from '../../models/product';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import { selectCart } from '../../store/cart/cart.reducer';
import { clearWishList, fetchWishListAsync } from '../../store/wish-list/wish-list.action';
import { current } from '@reduxjs/toolkit';
import { collection, doc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { clearCart, fetchCartAsync } from '../../store/cart/cart.action';
import LoadingModal from '../loading-modal/LoadingModal';
import AuthState from '../../models/auth';
import { WishListState } from '../../models/wish-list';
import { CartState } from '../../models/cart';

const Header = () => {
    const { currentUser, isAuthLoading } = useAppSelector<AuthState>(selectAuth);
    const { mode } = useAppSelector<any>(selectDarkMode) as DisplayModeState;
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const { cart, isCartLoading } = useAppSelector<CartState>(selectCart);

    const dispatch = useAppDispatch();
    const isLoading = useMemo(() => isAuthLoading || isWishListLoading, [isAuthLoading, isWishListLoading]);

    const handleLogout = () => {
        dispatch(logout());
    };
    const { i18n, t } = useTranslation(['common', 'header', 'product']);

    const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    }, []);

    const navItem = [
        { title: `${t('header:home')}`, url: '/' },
        {
            title: `${t('product:top')}`,
            url: '/top',
            subNav: [
                { title: `${t('product:t-shirt')}`, url: `/top/${TopCategory.T_SHIRT}` },
                { title: `${t('product:sweat-shirt')}`, url: `/top/${TopCategory.SWEAT_SHIRT}` },
                { title: `${t('product:jacket')}`, url: `/top/${TopCategory.JACKET}` },
                { title: `${t('product:hoodie')}`, url: `/top/${TopCategory.HOODIE}` },
            ],
        },
        {
            title: `${t('product:bottom')}`,
            url: '/bottom',
            subNav: [
                { title: `${t('product:pants')}`, url: `/top/${BottomCategory.PANTS}` },
                { title: `${t('product:jeans')}`, url: `/top/${BottomCategory.JEANS}` },
                { title: `${t('product:shorts')}`, url: `/top/${BottomCategory.SHORTS}` },
            ],
        },
        { title: `${t('header:about')}`, url: '/about' },
    ];
    useEffect(() => {
        if (currentUser) {
            dispatch(fetchWishListAsync.request());
            dispatch(fetchCartAsync.request());
        }
        if (localStorage.getItem('i18nextLng')!.length > 2) {
            i18next.changeLanguage('en');
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchWishListAsync.request());
        }

        return () => {
            dispatch(clearWishList());
        };
    }, []);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchCartAsync.request());
        }
    }, []);

    return (
        <>
            <header className="header p-0">
                <div className="bg-black w-100">
                    <div className="header--top container d-flex p-2 justify-content-between align-items-center">
                        <span className="text-white">Free shipping, 30-day return or refund guarantee.</span>
                        <div className="d-flex gap-3 align-items-center">
                            {mode === 'light' ? (
                                <i
                                    className="fa-solid fa-sun text-warning fs-5"
                                    onClick={() => dispatch(toggleDarkMode())}
                                ></i>
                            ) : (
                                <i
                                    className="fa-solid fa-moon text-white fs-5"
                                    onClick={() => dispatch(toggleDarkMode())}
                                ></i>
                            )}

                            <select
                                className="header--top__language bg-black border-0 text-white "
                                aria-label="Language select"
                                onChange={handleLanguageChange}
                                value={localStorage.getItem('i18nextLng') || 'en'}
                            >
                                <option value="en">English</option>
                                <option value="vn">Tiếng Việt</option>
                            </select>
                            <div className="header--top__user dropdown text-white d-flex align-items-center">
                                {currentUser ? (
                                    <>
                                        <p
                                            className="m-0 "
                                            id="dropdownUserIcon"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >{`${currentUser.firstName} ${currentUser.lastName},`}</p>
                                        <ul
                                            className="header__nav__control--dropdown__menu dropdown-menu dropdown-menu-end text-none px-3"
                                            aria-labelledby="dropdownUserIcon"
                                        >
                                            <li>
                                                <Link to={`user/view/${currentUser.id}`}>
                                                    <i className="fa-solid fa-user me-3"></i>
                                                    {t('common:profile')}
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger text-center d-block mx-auto"
                                                    onClick={handleLogout}
                                                >
                                                    {t('common:logout')}
                                                </button>
                                            </li>
                                        </ul>
                                    </>
                                ) : (
                                    <Link to="/login">{t('common:login')}</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header__main container d-flex align-items-center">
                    <div className="row w-100">
                        <div className="col-lg-4 col-md-3 d-flex align-items-center">
                            <div className="header__main__logo">
                                <Link to="/">
                                    <img src={Logo} alt="logo" />
                                </Link>
                            </div>
                        </div>
                        <nav className=" col-lg-4 col-md-6 text-capitalize">
                            <ul className="d-flex justify-content-between align-items-center">
                                {navItem &&
                                    navItem.map((item, index) => (
                                        <li
                                            key={index}
                                            className="header__main__item position-relative d-inline-block p-2 "
                                        >
                                            <Link to={item.url}>{item.title}</Link>
                                            {item.subNav && (
                                                <ul className="header__main__subnav position-absolute bg-black text-white px-3 py-2">
                                                    {item.subNav.map((subItem, subIndex) => (
                                                        <li key={subIndex}>
                                                            <Link to={subItem.url}>{subItem.title}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        </nav>
                        <div className="header__main__control col-lg-4 col-md-3 d-flex justify-content-end align-items-center gap-4">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <Link to="/wishlist">
                                <i className="fa-solid fa-heart"></i>
                            </Link>
                            <Link to="/shopping-cart">
                                <div className="header__main__control__cart">
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    <p className="header__main__control__cart__number">
                                        {cart && cart.cartItems.length}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(Header);
