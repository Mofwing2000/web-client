import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Hero from '../../components/hero/Hero';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase.config';
import { Collection, CollectionState } from '../../models/collection';
import { Link, useNavigate } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import ProductItem from '../../components/product-item/ProductItem';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectCollection } from '../../store/collection/collection.reducer';
import { clearCollection, fetchColllectionsAsync } from '../../store/collection/collection.action';
import { ProductState } from '../../models/product';
import { selectProduct } from '../../store/product/product.reducer';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { WishList, WishListState } from '../../models/wish-list';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import { fetchWishListAsync, toggleWishListAsync } from '../../store/wish-list/wish-list.action';
const Home = () => {
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const dispatch = useAppDispatch();
    const { collections, isCollectionLoading } = useAppSelector<CollectionState>(selectCollection);
    const { t } = useTranslation(['common', 'collection']);
    const fetchQuery = query(collection(db, 'collection'));
    const productFetchQuery = query(collection(db, 'product'), orderBy('createdAt', 'desc'), limit(8));

    const isLoading = useMemo(() => {
        return isProductLoading || isWishListLoading || isCollectionLoading;
    }, [isProductLoading, isWishListLoading, isCollectionLoading]);

    const handleToggleWishList = useCallback((productId: string) => {
        dispatch(toggleWishListAsync.request(productId));
    }, []);

    useEffect(() => {
        dispatch(fetchColllectionsAsync.request(fetchQuery));
        return () => {
            dispatch(clearCollection());
        };
    }, []);

    useEffect(() => {
        dispatch(fetchProductsAsync.request(productFetchQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, []);

    useEffect(() => {
        dispatch(fetchWishListAsync.request());
    }, []);
    const latestProductRender = useMemo(
        () =>
            products.length > 0 &&
            products.map((item, index) => (
                <div className="col-md-3 col-sm-6" key={index}>
                    <ProductItem
                        product={item}
                        onToggleWishList={() => handleToggleWishList(item.id)}
                        isLiked={wishList !== null && (wishList as WishList).productIdList.includes(item.id)}
                    />
                </div>
            )),
        [products, wishList],
    );

    const heroComponent = useMemo(() => collections && <Hero collectionsData={collections} />, [collections]);
    return (
        <>
            <div>
                {heroComponent}
                <div className="customer-service my-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className=" px-2 py-3">
                                    <div className=" mb-3">
                                        <i className="fa-solid fa-truck-fast fs-1"></i>
                                    </div>
                                    <div className="cat-cap">
                                        <h5 className="fw-bold">{t('common:fastDelivery')}</h5>
                                        <p>{t('common:shippingQuote')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className=" px-2 py-3">
                                    <div className=" mb-3">
                                        <i className="fa-solid fa-user-shield fs-1"></i>
                                    </div>

                                    <div className="cat-cap">
                                        <h5 className="fw-bold">{t('common:secureInfomation')}</h5>
                                        <p>{t('common:secureInfoQuote')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className=" px-2 py-3">
                                    <div className=" mb-3">
                                        <i className="fa-regular fa-credit-card fs-1"></i>
                                    </div>
                                    <div className="cat-cap">
                                        <h5 className="fw-bold">{t('common:easyPayment')}</h5>
                                        <p>{t('common:easyPaymentQuote')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6 px-2 py-3">
                                <div className="single-cat mb-30 wow fadeInUp">
                                    <div className=" mb-3">
                                        <i className="fa-solid fa-headset fs-1"></i>
                                    </div>
                                    <div className="cat-cap">
                                        <h5 className="fw-bold">{t('common:customerService')}</h5>
                                        <p>{t('common:customerServiceQuote')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <>
                            <h3 className="text-center">{t('common:newArrival')}</h3>
                            {latestProductRender}
                        </>
                    </div>
                </div>
                <div className="banner-bottom pb-3 position-relative d-none d-md-block">
                    <div className="d-block text-center">
                        <img
                            data-sizes="auto"
                            src="https://img.cdn.vncdn.io/nvn/ncdn/store/16762/bn/bannerchan.png"
                            data-src="https://img.cdn.vncdn.io/nvn/ncdn/store/16762/bn/bannerchan.png"
                            alt="banner"
                            sizes="1110px"
                        />
                    </div>
                </div>
            </div>
            {isLoading && (
                <>
                    <LoadingModal />
                    <div className="empty-content-container"></div>
                </>
            )}
        </>
    );
};

export default Home;
