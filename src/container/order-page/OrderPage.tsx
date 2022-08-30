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
import { Order } from '../../models/order';
import { PageLimit, PageOrder, PageOrderSort } from '../../type/page-type';
import { UserState } from '../../models/user';
import { selectUser } from '../../store/user/user.reducer';
import '../../sass/common.scss';
const OrderPage = () => {
    const { user } = useAppSelector<UserState>(selectUser);
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
        if (user) {
            const orderRef = collection(db, 'order');
            const filterQuery = query(
                orderRef,
                where('userId', '==', user.id),
                limit(pageSize as number),
                orderBy(
                    sortType === 'orderDate' ? 'orderDate' : sortType === 'orderState' ? 'orderState' : 'totalAmount',
                    sortOrder === 'asc' ? 'asc' : 'desc',
                ),
            );
            const fetchData = async () => {
                setIsLoading(true);
                const list: Order[] = [];
                try {
                    const querySnapshot = await getDocs(filterQuery);
                    querySnapshot.forEach((orderData) => {
                        if (orderData.exists()) {
                            list.push(orderData.data() as Order);
                        }
                    });
                    setIsLoading(false);
                    setOrdersData(list);
                } catch (error) {
                    if (error instanceof FirebaseError) {
                        toast.error(error.message);
                        setIsLoading(false);
                    }
                }
            };
            fetchData();
        }
    }, [pageSize, sortType, sortOrder, user]);

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
                <div className="empty-content-container">
                    <p className=" text-center">No data</p>
                </div>
            )}
            <Pagination onPageChange={handlePageClick} pageCount={pageCount} />
            {isLoading && <LoadingModal />}
        </>
    );
};

export default OrderPage;
