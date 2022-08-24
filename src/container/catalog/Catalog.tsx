import { collection, query, where } from 'firebase/firestore';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import AuthState from '../../models/auth';
import { CartItem } from '../../models/cart';
import { Product, ProductState } from '../../models/product';
import { WishList, WishListState } from '../../models/wish-list';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { selectAuth } from '../../store/root-reducer';
import { toggleWishListAsync } from '../../store/wish-list/wish-list.action';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
const Catalog = () => {
    const { type, category } = useParams();
    const { t } = useTranslation(['common', 'product']);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { currentUser } = useAppSelector<AuthState>(selectAuth);
    const { wishList } = useAppSelector<WishListState>(selectWishList);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'), where('productType', '==', type));
    }, [type]);

    console.log(wishList);

    const handleToggleWishList = useCallback((productId: string) => {
        if (currentUser) dispatch(toggleWishListAsync.request(productId));
        else navigate('/login');
    }, []);

    const itemList = useMemo(
        () =>
            products &&
            products.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem
                        product={product}
                        onToggleWishList={() => handleToggleWishList(product.id)}
                        isLiked={wishList !== null && (wishList as WishList).productIdList.includes(product.id)}
                    />
                </div>
            )),
        [wishList, products],
    );

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);

    return (
        <>
            <div>
                {/* <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">{t('common:home')}</Link>
                    </li>
                    {(type === ProductType.TOP || type === ProductType.BOTTOM) && (
                        <li className="breadcrumb-item">
                            <Link to={`/${type}`}>{t(`product:${type}`)}</Link>
                        </li>
                    )}
                    {(type === ProductType.TOP || type === ProductType.BOTTOM) && (
                        <li className="breadcrumb-item">
                            <Link to={`/${type}`}>{t(`product:${type}`)}</Link>
                        </li>
                    )}
                    {(category === ProductType.TOP || category === ProductType.BOTTOM) && (
                        <li className="breadcrumb-item">
                            <Link to={`/${type}`}>{t(`product:${type}`)}</Link>
                        </li>
                    )}
                </ol>
            </nav> */}
                <div className="container pt-5">
                    <div className="row">
                        <div className="col-lg-3"></div>
                        <div className="col-lg-9">
                            <div className="row g-4">{itemList}</div>
                        </div>
                    </div>
                </div>
            </div>
            {isProductLoading && <LoadingModal />}
        </>
    );
};

export default memo(Catalog);
