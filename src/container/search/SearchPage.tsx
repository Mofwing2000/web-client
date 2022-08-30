import { collection, orderBy, query } from 'firebase/firestore';
import queryString from 'query-string';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import Pagination from '../../components/pagination/Pagination';
import ProductFilterBar from '../../components/product-filter-bar/ProductFilterBar';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Bottom, ProductState, Top } from '../../models/product';
import { UserState } from '../../models/user';
import { WishList, WishListState } from '../../models/wish-list';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { selectUser } from '../../store/user/user.reducer';
import { fetchWishListAsync, toggleWishListAsync } from '../../store/wish-list/wish-list.action';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import { PageLimit, PageOrder, PageProductSort } from '../../type/page-type';

const SearchPage = () => {
    const { t } = useTranslation(['common', 'product']);
    const { user } = useAppSelector<UserState>(selectUser);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const location = useLocation();
    const searchKeyword = useMemo(() => queryString.parse(location.search).keyword as string, [location.search]);
    const dispatch = useAppDispatch();
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageProductSort>('id');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [currentFilteredProducts, setCurrentFilteredProducts] = useState<(Top | Bottom)[]>([]);

    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'), orderBy(sortType, sortOrder));
    }, [sortType, sortOrder]);

    const isLoading = useMemo(() => {
        return isProductLoading || isWishListLoading;
    }, [isWishListLoading, isProductLoading]);

    const handleToggleWishList = useCallback((productId: string) => {
        dispatch(toggleWishListAsync.request(productId));
    }, []);

    const searchProducts = useMemo(() => {
        if (searchKeyword) {
            return products.filter((item) => item.name.toLowerCase().includes(searchKeyword));
        }
    }, [searchKeyword, products]);

    const handlePageClick = useCallback(
        (event: { selected: number }) => {
            if (searchProducts) {
                const newOffset = (event.selected * 5) % searchProducts.length;
                setItemOffset(newOffset);
            }
        },
        [searchProducts],
    );

    useEffect(() => {
        if (searchProducts) {
            const endOffset = itemOffset + pageSize;
            setCurrentFilteredProducts(searchProducts.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(searchProducts.length / pageSize));
        }
    }, [itemOffset, searchProducts, pageSize]);

    const itemList = useMemo(
        () =>
            currentFilteredProducts &&
            currentFilteredProducts.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem
                        product={product}
                        onToggleWishList={() => handleToggleWishList(product.id)}
                        isLiked={wishList !== null && (wishList as WishList).productIdList.includes(product.id)}
                    />
                </div>
            )),
        [wishList, currentFilteredProducts],
    );

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);

    useEffect(() => {
        if (!wishList && user) dispatch(fetchWishListAsync.request());
    }, []);

    return (
        <>
            <div className="wish-list mt-5">
                <h4 className="text-center mb-5">
                    {t('common:searchPageTitle')} {searchKeyword}
                </h4>

                {searchProducts && searchProducts.length ? (
                    <div className="wish-list__products">
                        <div className="container">
                            <div className="row">
                                <div className="col-8 mx-auto ">
                                    <ProductFilterBar
                                        pageSize={pageSize}
                                        sortType={sortType}
                                        sortOrder={sortOrder}
                                        setPageSize={setPageSize}
                                        setSortType={setSortType}
                                        setSortOrder={setSortOrder}
                                    />
                                    <div className="row">{itemList}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="wish-list--empty ">
                        <p className="text-center fs-4">{t('common:noItemFound')}</p>
                    </div>
                )}
                <Pagination onPageChange={handlePageClick} pageCount={pageCount} />
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(SearchPage);
