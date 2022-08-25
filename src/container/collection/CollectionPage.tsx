import { FirebaseError } from '@firebase/util';
import { collection, doc, getDoc, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductItem from '../../components/product-item/ProductItem';
import { db } from '../../config/firebase.config';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import AuthState from '../../models/auth';
import { Collection } from '../../models/collection';
import { ProductState } from '../../models/product';
import { WishList, WishListState } from '../../models/wish-list';
import { clearProducts, fetchProductsAsync } from '../../store/product/product.action';
import { selectProduct } from '../../store/product/product.reducer';
import { selectAuth } from '../../store/root-reducer';
import { toggleWishListAsync } from '../../store/wish-list/wish-list.action';
import { selectWishList } from '../../store/wish-list/wish-list.reducer';
import './collection-page.scss';
const CollectionPage = () => {
    const [collectionData, setCollectionData] = useState<Collection>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { collectionId } = useParams();
    const { t } = useTranslation(['common', 'product']);
    const { products, isProductLoading } = useAppSelector<ProductState>(selectProduct);
    const { wishList, isWishListLoading } = useAppSelector<WishListState>(selectWishList);
    const { currentUser } = useAppSelector<AuthState>(selectAuth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const fetchProductQuery = useMemo(() => {
        return query(collection(db, 'product'));
    }, []);

    const handleToggleWishList = useCallback((productId: string) => {
        dispatch(toggleWishListAsync.request(productId));
    }, []);

    const collectionProducts = useMemo(() => {
        if (products && collectionData)
            return products.filter((product) => collectionData.productsList.includes(product.id));
    }, [products, collectionData]);

    const itemList = useMemo(
        () =>
            collectionProducts &&
            collectionProducts.map((product, index) => (
                <div className="col-lg-4 col-sm-6" key={index}>
                    <ProductItem
                        product={product}
                        onToggleWishList={() => handleToggleWishList(product.id)}
                        isLiked={wishList !== null && (wishList as WishList).productIdList.includes(product.id)}
                    />
                </div>
            )),
        [wishList, collectionProducts],
    );

    useEffect(() => {
        dispatch(fetchProductsAsync.request(fetchProductQuery));
        return () => {
            dispatch(clearProducts());
        };
    }, [fetchProductQuery]);
    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            try {
                const docSnap = await getDoc(doc(db, 'collection', collectionId as string));
                if (docSnap.exists()) {
                    setCollectionData(docSnap.data() as Collection);
                    setIsLoading(false);
                }
            } catch (error) {
                if (error instanceof FirebaseError) {
                    toast.error(error.message);
                    setIsLoading(false);
                }
            }
        };
        fetchCollection();
    });

    return (
        <div className="collection mt-5">
            <div className=" container-sm mb-3">
                <div className="row">
                    <div className="col-12 col-md-8 mx-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb text-capitalize">
                                <li className="breadcrumb-item">
                                    <Link to="/">{t('common:home')}</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {t('common:collection')} {collectionData && collectionData.title}
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            <div
                className="collection__banner mb-5"
                style={{
                    backgroundImage: `url(${collectionData?.collectionBanner})`,
                }}
            ></div>
            <div className="collection__products">
                <div className="container">
                    <div className="row">
                        <div className="col-8 mx-auto ">
                            <h3 className="text-center mb-5">{collectionData?.title}</h3>
                            <div className="row">{itemList}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionPage;
