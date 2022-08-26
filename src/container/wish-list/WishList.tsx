import { collection, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { ProductState } from '../../models/product';
import { WishList, WishListState } from '../../models/wish-list';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { toggleWishListAsync } from '../../store/wish-list/wish-list.action';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import './wish-list.scss';
const WishListPage = () => {
    const { t } = useTranslation(['common', 'product']);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const dispatch = useAppDispatch();

    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'));
    }, []);

    const isLoading = useMemo(() => {
        return isProductLoading || isWishListLoading;
    }, [isWishListLoading, isProductLoading]);

    const handleToggleWishList = useCallback((productId: string) => {
        dispatch(toggleWishListAsync.request(productId));
    }, []);

    const wishListProduct = useMemo(() => {
        if (products && wishList) return products.filter((product) => wishList.productIdList.includes(product.id));
    }, [products, wishList]);

    const itemList = useMemo(
        () =>
            wishListProduct &&
            wishListProduct.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem
                        product={product}
                        onToggleWishList={() => handleToggleWishList(product.id)}
                        isLiked={wishList !== null && (wishList as WishList).productIdList.includes(product.id)}
                    />
                </div>
            )),
        [wishList, wishListProduct],
    );

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);

    return (
        <>
            <div className="wish-list mt-5">
                <div className=" container-sm mb-3">
                    <div className="row">
                        <div className="col-12 col-md-8 mx-auto">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb text-capitalize">
                                    <li className="breadcrumb-item">
                                        <Link to="/">{t('common:home')}</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {t('common:wishList')}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                {wishList?.productIdList.length ? (
                    <div className="wish-list__products">
                        <div className="container">
                            <div className="row">
                                <div className="col-8 mx-auto ">
                                    <div className="row">{itemList}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="wish-list--empty ">
                        <p className="text-center fs-4">No item in wish-list</p>
                    </div>
                )}
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default WishListPage;
