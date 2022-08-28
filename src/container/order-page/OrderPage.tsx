import { FirebaseError } from '@firebase/util';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import OrderTable from '../../components/order-table/OrderTable';
import OrderFilterBar from '../../components/order-filter-bar/OrderFilterBar';
import Pagination from '../../components/pagination/Pagination';
import { db } from '../../config/firebase.config';
import { useAppSelector } from '../../helpers/hooks';
import AuthState from '../../models/auth';
import { Order } from '../../models/order';
import { selectAuth } from '../../store/root-reducer';
import { PageLimit, PageOrder, PageOrderSort } from '../../type/page-type';

const OrderPage = () => {
    const { currentUser, isAuthLoading } = useAppSelector<AuthState>(selectAuth);
    const [ordersData, setOrdersData] = useState<Order[]>();
    const [pageSize, setPageSize] = useState<PageLimit>(10);
    const [sortType, setSortType] = useState<PageOrderSort>('orderDate');
    const [sortOrder, setSortOrder] = useState<PageOrder>('asc');
    const [isLoading, setIsLoading] = useState<boolean>();
    const [pageCount, setPageCount] = useState<number>(0);
    const [itemOffset, setItemOffset] = useState<number>(0);
    const [currentFilteredOrder, setCurrentFilteredOrder] = useState<Order[]>();
    const { t } = useTranslation(['common', 'order']);

    const handlePageClick = useCallback(
        (event: { selected: number }) => {
            if (ordersData) {
                const newOffset = (event.selected * 5) % ordersData.length;
                setItemOffset(newOffset);
            }
        },
        [ordersData],
    );

    useEffect(() => {
        if (ordersData) {
            const endOffset = itemOffset + pageSize;
            setCurrentFilteredOrder(ordersData.slice(itemOffset, endOffset));
            setPageCount(Math.ceil(ordersData.length / pageSize));
        }
    }, [itemOffset, ordersData, pageSize]);

    useEffect(() => {
        if (currentUser) {
            const orderRef = collection(db, 'order');
            const filterQuery = query(
                orderRef,
                where('userId', '==', currentUser.id),
                limit(pageSize as number),
                orderBy(
                    sortType === 'orderDate' ? 'orderDate' : sortType === 'orderState' ? 'orderState' : 'totalAmount',
                    sortOrder === 'asc' ? 'asc' : 'desc',
                ),
            );
            const fetchData = async () => {
                const list: Order[] = [];
                try {
                    const querySnapshot = await getDocs(filterQuery);
                    querySnapshot.forEach((orderData) => {
                        if (orderData.exists()) {
                            list.push(orderData.data() as Order);
                        }
                    });
                    setOrdersData(list);
                } catch (error) {
                    if (error instanceof FirebaseError) {
                        toast.error(error.message);
                    }
                }
            };
            fetchData();
        }
    }, [pageSize, sortType, sortOrder, currentUser]);

    return (
        <>
            {ordersData ? (
                <div className="container">
                    <div className="row">
                        <div className="order-manage mt-5 col-10 mx-auto">
                            <OrderFilterBar
                                pageSize={pageSize}
                                sortType={sortType}
                                sortOrder={sortOrder}
                                setPageSize={setPageSize}
                                setSortType={setSortType}
                                setSortOrder={setSortOrder}
                            />
                            <div className="order-manage__table overflow-auto">
                                {currentFilteredOrder && <OrderTable ordersData={currentFilteredOrder} />}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="order-manage__filter text-center">
                    <p>No data</p>
                </div>
            )}
            <Pagination onPageChange={handlePageClick} pageCount={pageCount} />
            {isLoading && <LoadingModal />}
        </>
    );
};

export default OrderPage;
