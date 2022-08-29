import React, { memo, useEffect, useMemo, useState } from 'react';
import Hero from '../../components/hero/Hero';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase.config';
import { Collection, CollectionState } from '../../models/collection';
import { Link, useNavigate } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import ProductItem from '../../components/product-item/ProductItem';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectCollection } from '../../store/collection/collection.reducer';
import { clearCollection, fetchColllectionsAsync } from '../../store/collection/collection.action';
import deliImg from '../../assets/image/services1.svg';
import secureImg from '../../assets/image/services2.svg';
import paymentImg from '../../assets/image/services2.svg';
import handleImg from '../../assets/image/services4.svg';
const Home = () => {
    // const [collectionsData, setCollectionsData] = useState<Collection[]>();
    // const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { collections, isCollectionLoading } = useAppSelector<CollectionState>(selectCollection);
    const { t } = useTranslation(['common', 'collection']);
    const fetchQuery = query(collection(db, 'collection'));
    useEffect(() => {
        dispatch(fetchColllectionsAsync.request(fetchQuery));
        return () => {
            dispatch(clearCollection());
        };
    }, []);
    const navigate = useNavigate();
    // useEffect(() => {
    //     setIsLoading(true);
    //     const productQuery = query(collection(db, 'collection'));
    //     const unsub = onSnapshot(
    //         productQuery,
    //         (snapShot) => {
    //             let list: Array<Collection> = [];
    //             snapShot.docs.forEach((docItem) => {
    //                 list.push({ ...docItem.data() } as Collection);
    //             });
    //             setCollectionsData(list);
    //             setIsLoading(false);
    //         },
    //         (error) => {
    //             if (error instanceof FirebaseError) toast.error(error.message);
    //             setIsLoading(false);
    //         },
    //     );

    //     return () => {
    //         unsub();
    //     };
    // }, []);

    const heroComponent = useMemo(() => collections && <Hero collectionsData={collections} />, [collections]);
    return (
        <>
            <div>
                {heroComponent}
                <div className="categories-area section-padding40 gray-bg">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-cat mb-50 wow fadeInUp">
                                    <div className="cat-icon">
                                        <img src={deliImg} alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5>Fast Delivery</h5>
                                        <p>
                                            Reasonable price delivery fast and professional service excellent technology
                                            support
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-cat mb-50 wow fadeInUp">
                                    <div className="cat-icon"></div>
                                    <div className="cat-cap">
                                        <h5>Secure Infomation</h5>
                                        <p>We guarantee that all customers&apos; information are 100% secured</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-cat mb-50 wow fadeInUp">
                                    <div className="cat-icon">
                                        <img src={paymentImg} alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5>Fast &amp; Free Delivery</h5>
                                        <p>Free delivery on all orders</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-cat mb-30 wow fadeInUp">
                                    <div className="cat-icon">
                                        <img src={handleImg} alt="" />
                                    </div>
                                    <div className="cat-cap">
                                        <h5>Fast &amp; Free Delivery</h5>
                                        <p>Free delivery on all orders</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">{/* <ProductItem /> */}</div>
                </div>
            </div>
            {isCollectionLoading && (
                <>
                    <LoadingModal />
                    <div className="empty-content-container"></div>
                </>
            )}
        </>
    );
};

export default Home;
