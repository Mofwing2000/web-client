import React, { memo, useEffect, useMemo, useState } from 'react';
import Hero from '../../components/hero/Hero';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase.config';
import { Collection } from '../../models/collection';
import { Link, useNavigate } from 'react-router-dom';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import ProductItem from '../../components/product-item/ProductItem';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectCollection } from '../../store/collection/collection.reducer';
import { clearCollection, fetchColllectionsAsync } from '../../store/collection/collection.action';
const Home = () => {
    // const [collectionsData, setCollectionsData] = useState<Collection[]>();
    // const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { collections, isCollectionLoading } = useAppSelector<any>(selectCollection);
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
                <div className="row">
                    <div className="col-3">{/* <ProductItem /> */}</div>
                </div>
            </div>
            {isCollectionLoading && <LoadingModal />}
        </>
    );
};

export default Home;
