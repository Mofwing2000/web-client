import { collection, orderBy, query, where } from 'firebase/firestore';
import queryString from 'query-string';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import Pagination from '../../components/pagination/Pagination';
import ProductFilterBar from '../../components/product-filter-bar/ProductFilterBar';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { Bottom, BottomCategory, Color, ProductState, ProductType, Size, Top, TopCategory } from '../../models/product';
import { UserState } from '../../models/user';
import { WishList, WishListState } from '../../models/wish-list';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { selectUser } from '../../store/user/user.reducer';
import { fetchWishListAsync, toggleWishListAsync } from '../../store/wish-list/wish-list.action';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import { PageLimit, PageOrder, PageProductSort } from '../../type/page-type';
import './catalog.scss';

const Catalog = () => {
    const { type } = useParams();
    const { t } = useTranslation(['common', 'product']);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { user } = useAppSelector<UserState>(selectUser);
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const [currentFilteredProducts, setCurrentFilteredProducts] = useState<(Top | Bottom)[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageProductSort>('id');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');

    const [category, setCategory] = useState<TopCategory | BottomCategory | null>(() => {
        if (typeof queryString.parse(location.search).category === 'string') {
            return queryString.parse(location.search).category as TopCategory | BottomCategory;
        } else return null;
    });
    const [size, setSize] = useState<Size[]>(() => {
        if (typeof queryString.parse(location.search).size === 'string')
            return (queryString.parse(location.search).size as string).split(',') as Size[];
        else return [];
    });
    const [color, setColor] = useState<Color[]>(() => {
        if (typeof queryString.parse(location.search).color === 'string')
            return (queryString.parse(location.search).color as string).split(',') as Color[];
        else return [];
    });

    const checkCategory = (item: Top | Bottom) => {
        if (category) {
            if (type === ProductType.TOP) {
                return (
                    (item as Top).category.findIndex(
                        (categoryItem) => categoryItem.categoryName === category && categoryItem.isCategory === true,
                    ) !== -1
                );
            } else if (type === ProductType.BOTTOM) {
                return (
                    (item as Bottom).category.findIndex(
                        (categoryItem) => categoryItem.categoryName === category && categoryItem.isCategory === true,
                    ) !== -1
                );
            } else return true;
        } else return true;
    };

    const checkColor = (item: Top | Bottom) => {
        if (color.length) {
            return item.color.some(
                (colorItem) => color.includes(colorItem.colorName) && colorItem.isAvailable === true,
            );
        } else {
            return true;
        }
    };

    const checkSize = (item: Top | Bottom) => {
        if (size.length) {
            return item.size.some((sizeItem) => size.includes(sizeItem.sizeName) && sizeItem.isAvailable === true);
        } else {
            return true;
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            return checkCategory(item) && checkColor(item) && checkSize(item);
        });
    }, [products, category, size, color]);
    console.log(filteredProducts);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // console.log(queryString.parse(location.search).category as string);

    const topCategories = [
        TopCategory.TOP,
        TopCategory.T_SHIRT,
        TopCategory.SWEAT_SHIRT,
        TopCategory.HOODIE,
        TopCategory.JACKET,
    ];
    const bottomCategories = [BottomCategory.BOTTOM, BottomCategory.JEANS, BottomCategory.PANTS, BottomCategory.SHORTS];
    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'), where('productType', '==', type), orderBy(sortType, sortOrder));
    }, [type, sortType, sortOrder]);

    const sizesList: Size[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

    const colorsList: Color[] = [
        Color.BLUE,
        Color.BLACK,
        Color.BROWN,
        Color.GRAY,
        Color.NAVY,
        Color.PINK,
        Color.RED,
        Color.WHITE,
        Color.YELLOW,
    ];

    const isLoading = useMemo(() => {
        return isProductLoading || isWishListLoading;
    }, [isProductLoading, isWishListLoading]);

    const handleToggleWishList = useCallback(
        (productId: string) => {
            if (user) dispatch(toggleWishListAsync.request(productId));
            else navigate('/login');
        },
        [user],
    );

    const handleColorToggle = useCallback(
        (colorItem: Color) => {
            if (color.includes(colorItem)) setColor(color.filter((item) => item !== colorItem));
            else setColor([...color, colorItem]);
        },
        [color],
    );

    const handleSizeToggle = useCallback(
        (sizeItem: Size) => {
            if (size.includes(sizeItem)) setSize(size.filter((item) => item !== sizeItem));
            else setSize([...size, sizeItem]);
        },
        [size],
    );

    const handlePageClick = (event: { selected: number }) => {
        const newOffset = (event.selected * 5) % filteredProducts.length;
        setItemOffset(newOffset);
    };

    const itemList = useMemo(() => {
        if (currentFilteredProducts.length) {
            return currentFilteredProducts.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem
                        product={product}
                        onToggleWishList={() => handleToggleWishList(product.id)}
                        isLiked={wishList !== null && wishList.productIdList.includes(product.id)}
                    />
                </div>
            ));
        } else {
            return (
                <div className="empty-content-container">
                    <p className="text-center">No item available</p>
                </div>
            );
        }
    }, [wishList, currentFilteredProducts]);

    // console.log(currentFilteredProducts);
    const searchParams = useMemo(() => {
        const filter: {
            category: TopCategory | BottomCategory | null;
            color: Color[];
            size: Size[];
        } = { category: null, color: [], size: [] };
        if (category) filter.category = category;
        if (color.length) filter.color = [...color];
        if (size.length) filter.size = [...size];
        return queryString.stringify(filter, { arrayFormat: 'comma', skipNull: true });
    }, [category, color, size]);

    useEffect(() => {
        const endOffset = itemOffset + pageSize;
        setCurrentFilteredProducts(filteredProducts.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(filteredProducts.length / pageSize));
    }, [itemOffset, filteredProducts, pageSize]);

    useEffect(() => {
        if (category === null) navigate(`../${type}/?${searchParams}`);
        else if (topCategories.includes(category as TopCategory)) navigate(`../${ProductType.TOP}/?${searchParams}`);
        else navigate(`../${ProductType.BOTTOM}/?${searchParams}`);
    }, [searchParams]);

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);

    useEffect(() => {
        dispatch(fetchWishListAsync.request());
    }, []);

    return (
        <>
            <div className="catalog">
                <div className=" container-sm mb-3 mt-5">
                    <div className="row">
                        <div className="col-12 col-md-8 mx-auto">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb text-capitalize">
                                    <li className="breadcrumb-item">
                                        <Link to="/">{t('common:home')}</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {t(`product:${type}`)}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="container pt-5">
                    <div className="row">
                        <div className="col-lg-3">
                            <div className="catalog__sidebar text-capitalize">
                                <div className="catalog__sidebar__item pb-2 mb-4">
                                    <div className="catalog__sidebar__item__heading">
                                        <h5
                                            className="text-uppercase fw-bold cursor"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#topCategories"
                                            aria-expanded="false"
                                            aria-controls="topCategories"
                                        >
                                            {t('common:top')}
                                        </h5>
                                    </div>
                                    <div className="collapse" id="topCategories">
                                        <div>
                                            <ul>
                                                {topCategories.map((categoryItem, index) => (
                                                    <li
                                                        className={`${
                                                            categoryItem === category ? 'text-danger' : ''
                                                        } cursor-primary`}
                                                        key={index}
                                                        onClick={() => setCategory(categoryItem)}
                                                    >
                                                        {categoryItem}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="catalog__sidebar__item pb-2 mb-4">
                                    <div className="catalog__sidebar__item__heading">
                                        <h5
                                            className="text-uppercase fw-bold cursor"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#bottomCategories"
                                            aria-expanded="false"
                                            aria-controls="bottomCategories"
                                        >
                                            {t('common:bottom')}
                                        </h5>
                                    </div>
                                    <div className="collapse" id="bottomCategories">
                                        <div>
                                            <ul>
                                                {bottomCategories.map((categoryItem, index) => (
                                                    <li
                                                        className={`${
                                                            categoryItem === category ? 'text-danger' : ''
                                                        } cursor-primary`}
                                                        key={index}
                                                        onClick={() => setCategory(categoryItem)}
                                                    >
                                                        {categoryItem}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="catalog__sidebar__item pb-2 mb-4">
                                    <div className="catalog__sidebar__item__heading">
                                        <h5
                                            className="text-uppercase fw-bold cursor"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#colorCategories"
                                            aria-expanded="false"
                                            aria-controls="colorCategories"
                                        >
                                            {t('product:color')}
                                        </h5>
                                    </div>
                                    <div className="collapse" id="colorCategories">
                                        <div>
                                            <ul className="d-flex align-items-center gap-2 pb-2 flex-wrap">
                                                {colorsList.map((colorItem, index) => (
                                                    <li
                                                        className={`catalog__sidebar__item__color cursor-primary ${
                                                            color && color.includes(colorItem) ? 'active' : ''
                                                        }`}
                                                        key={index}
                                                    >
                                                        <i
                                                            className={`fa-solid fa-circle`}
                                                            style={{ color: `${colorItem.toLowerCase()}` }}
                                                            onClick={() => handleColorToggle(colorItem)}
                                                        ></i>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="catalog__sidebar__item pb-2 mb-4">
                                    <div className="catalog__sidebar__item__heading">
                                        <h5
                                            className="text-uppercase fw-bold cursor"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#sizeCategories"
                                            aria-expanded="false"
                                            aria-controls="sizeCategories"
                                        >
                                            {t('product:size')}
                                        </h5>
                                    </div>
                                    <div className="collapse" id="sizeCategories">
                                        <div>
                                            <ul className="d-flex align-items-center gap-2 pb-2 flex-wrap">
                                                {sizesList.map((sizeItem, index) => (
                                                    <li
                                                        className={`catalog__sidebar__item__size cursor-primary ${
                                                            size && size.includes(sizeItem) ? 'active' : ''
                                                        }`}
                                                        key={index}
                                                        onClick={() => handleSizeToggle(sizeItem)}
                                                    >
                                                        <span>{sizeItem}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-9">
                            <ProductFilterBar
                                pageSize={pageSize}
                                sortType={sortType}
                                sortOrder={sortOrder}
                                setPageSize={setPageSize}
                                setSortType={setSortType}
                                setSortOrder={setSortOrder}
                            />
                            <div className="row g-4">{itemList}</div>
                        </div>
                    </div>
                </div>
                <Pagination onPageChange={handlePageClick} pageCount={pageCount} />
            </div>
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(Catalog);

// color =red ,size = xl,m, category ='pant'
// .filter(item => {
//     return category === 'pant' && item.color.every(color Color.colorname)
// })

// item [color{name, is}] [size,[name ,is]]
