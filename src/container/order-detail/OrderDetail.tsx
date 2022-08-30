import { FirebaseError } from '@firebase/util';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { db } from '../../config/firebase.config';
import { firebaseDateFormat } from '../../helpers/common';
import { useAppSelector } from '../../helpers/hooks';
import { Order, OrderState } from '../../models/order';
import { Bottom, Top } from '../../models/product';
import { User, UserState } from '../../models/user';
import '../../sass/common.scss';
import { selectUser } from '../../store/user/user.reducer';
import '../../sass/common.scss';
import './order-detail.scss';

const OrderDetail = () => {
    const { t } = useTranslation(['common', 'order', 'user', 'product']);
    const { orderId } = useParams();
    const { user } = useAppSelector<UserState>(selectUser);
    const [orderData, setOrderData] = useState<Order>();
    const [userData, setUserData] = useState<User>();
    const [orderedProductsData, setOrderedProductsData] = useState<(Top | Bottom)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>();
    const trackingFormRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, 'order', orderId as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && user) {
                const order = docSnap.data() as Order;
                if (order.userId === user.id) {
                    setOrderData(order);
                    const fetch = async () => {
                        try {
                            const userDocSnap = await getDoc(doc(db, 'user', order.userId));
                            if (userDocSnap.exists()) {
                                const userDataResult = userDocSnap.data() as User;
                                setUserData(userDataResult);
                            }
                        } catch (error) {
                            if (error instanceof FirebaseError) toast.error(error.message);
                        }

                        try {
                            const list: (Top | Bottom)[] = [];
                            order.orderedProducts.forEach(async (item, index) => {
                                const orderedProductSnap = await getDoc(doc(db, 'product', item.id));
                                if (orderedProductSnap.exists()) {
                                    const product = orderedProductSnap.data() as Top | Bottom;
                                    list.push(product);
                                }
                                if (index === order.orderedProducts.length - 1) setOrderedProductsData([...list]);
                            });
                        } catch (error) {
                            if (error instanceof FirebaseError) toast.error(error.message);
                        }
                    };
                    fetch();
                }
            }
            setIsLoading(false);
        } catch (error) {
            if (error instanceof FirebaseError) {
                toast.error(error.message);
                setIsLoading(false);
            }
        }
    }, [user]);

    const handleMarkShipped = async () => {
        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'order', orderData!.id), {
                orderState: OrderState.DELIVERED,
                receivingDate: new Date(Date.now()),
            });
            await fetchData();
            setIsLoading(false);
        } catch (error) {
            if (error instanceof FirebaseError) toast.error(error.message);
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (trackingFormRef.current!.classList.contains('show')) trackingFormRef.current!.classList.remove('show');
        setIsLoading(false);
        try {
            await updateDoc(doc(db, 'order', orderData!.id), {
                orderState: OrderState.CANCELED,
            });
            await fetchData();
            setIsLoading(false);
        } catch (error) {
            if (error instanceof FirebaseError) toast.error(error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {orderData ? (
                <div className="order-detail container my-5">
                    <div className="order-detail__tracking row d-flex justify-content-between mb-5">
                        <h5 className="order-detail__tracking__id">
                            <span className="text-upppercase">{t('order:order')} </span>
                            <span className="fw-bold">#{orderData.id}</span>
                        </h5>

                        <div className="order-detail__tracking__number text-sm-right d-flex justify-content-between align-items-center">
                            <span>
                                USPS:{' '}
                                <span
                                    className={`order-detail__tracking__number__edit ${
                                        orderData.orderState !== OrderState.CANCELED &&
                                        orderData.orderState !== OrderState.DELIVERED &&
                                        'editable'
                                    } fw-bold position-relative`}
                                >
                                    {(orderData.orderState === OrderState.CANCELED && (
                                        <span className="text-danger">{t('order:canceled')}</span>
                                    )) ||
                                        ((orderData.orderState === OrderState.SHIPPED ||
                                            orderData.orderState === OrderState.DELIVERED) && (
                                            <span>{orderData.trackingNumber}</span>
                                        ))}
                                    <div
                                        className="order-detail__tracking__number__dropdown p-2 position-absolute end-0"
                                        ref={trackingFormRef}
                                    ></div>
                                </span>
                            </span>

                            {orderData.orderState === OrderState.PENDING && (
                                <button className="btn btn-sm btn-danger" onClick={handleCancelOrder}>
                                    {t('order:cancelOrder')}
                                </button>
                            )}

                            {orderData.orderState === OrderState.SHIPPED && (
                                <button className="btn btn-sm btn-primary" onClick={handleMarkShipped}>
                                    {t('order:markAsDelivered')}
                                </button>
                            )}
                        </div>

                        <div className="order-detail__tracking__progress">
                            <ul
                                id="progressbar"
                                className="order-detail__tracking__progress__progress-bar text-center d-none d-sm-block"
                            >
                                <li
                                    className={`order-detail__tracking__progress__progress-bar__item step0 ${
                                        orderData.orderState !== OrderState.CANCELED && 'active'
                                    }`}
                                ></li>
                                <li
                                    className={`order-detail__tracking__progress__progress-bar__item step0 ${
                                        orderData.orderState !== OrderState.CANCELED &&
                                        (orderData.orderState === OrderState.SHIPPED ||
                                            orderData.orderState === OrderState.DELIVERED) &&
                                        'active'
                                    }`}
                                ></li>
                                <li
                                    className={`order-detail__tracking__progress__progress-bar__item step0 ${
                                        orderData.orderState !== OrderState.CANCELED &&
                                        orderData.orderState === OrderState.DELIVERED &&
                                        'active'
                                    }`}
                                ></li>
                            </ul>
                            <div className="order-detail__tracking__progress__step d-flex justify-content-between d-none d-sm-flex">
                                <div className="d-flex flex-column align-items-center">
                                    <i className="order-detail__tracking__progress__step__icon fa-solid fa-list-check"></i>
                                    <p className="order-detail__tracking__progress__step__label text-uppercase">
                                        {t('order:pending')}
                                    </p>
                                </div>
                                <div className="order-detail__tracking__progress__step__icon d-flex">
                                    <div className="d-flex flex-column align-items-center">
                                        <i className="order-detail__tracking__progress__step__icon fa-solid fa-truck"></i>
                                        <p className="order-detail__tracking__progress__step__label text-uppercase">
                                            {t('order:shipped')}
                                        </p>
                                    </div>
                                </div>
                                <div className="order-detail__tracking__progress__step__icon d-flex">
                                    <div className="d-flex flex-column align-items-center">
                                        <i className="order-detail__tracking__progress__step__icon fa-solid fa-house"></i>
                                        <p className="order-detail__tracking__progress__step__label text-uppercase">
                                            {t('order:delivered')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-detail__info mb-5">
                        <div className="row g-5">
                            <div className="order-detail__info__user col-md-6">
                                <span className="fw-bold mb-3 d-inline-block">{t('order:buyerInfo')}</span>
                                <p className="mb-1">
                                    <span className="fw-bold">{t('user:name')}:</span>
                                    {userData?.firstName + '' + userData?.lastName}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold">Email: </span>
                                    {userData?.email}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold">{t('user:phoneNumber')}: </span>
                                    {userData?.phoneNumber}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold">{t('user:address')}: </span>
                                    {userData?.address}
                                </p>
                            </div>
                            <div className="order-detail__info__shipping col-md-6 ">
                                <span className="fw-bold mb-3 d-inline-block">{t('order:shippingInfo')}: </span>
                                <p className="mb-1">
                                    <span className="fw-bold">{t('order:shippingAddress')}: </span>
                                    {orderData.shippingAddress}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold text-capitalize">{t('order:shippingDate')}: </span>
                                    {orderData.shippingDate && firebaseDateFormat(orderData.shippingDate!)}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold text-capitalize">{t('order:receivingDate')}: </span>
                                    {orderData.receivingDate && firebaseDateFormat(orderData.receivingDate!)}
                                </p>
                                <p className="mb-1">
                                    <span className="fw-bold">{t('order:note')}: </span>
                                    {orderData.note}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="order-detail__products">
                        <div className="order-detail__products__list card p-3">
                            {orderedProductsData &&
                                orderedProductsData.map((item, index) => (
                                    <div
                                        className="order-detail__products__list__item py-3 d-flex mx-auto w-100"
                                        key={index}
                                    >
                                        <div className="order-detail__products__list__item__image d-none d-sm-flex align-items-center">
                                            <div
                                                className="square-div-with-background"
                                                style={{ backgroundImage: `url(${item.photoUrls[0]})` }}
                                            ></div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items flex-fill">
                                            <div className="order-detail__products__list__detail">
                                                <p className="fw-bold fs-5">{item.name}</p>
                                                <p className="m-0 text-capitalize">
                                                    {t('order:variation')}:{' '}
                                                    {t(`product:${orderData.orderedProducts[index]?.color}`) +
                                                        ', ' +
                                                        orderData.orderedProducts[index]?.size}
                                                </p>
                                                <p className="m-0">
                                                    {t('order:quantity')}: {orderData.orderedProducts[index]?.quantity}
                                                </p>
                                            </div>
                                            <div className="order-detail__products__list__price d-flex align-items-end align-items-sm-center">
                                                {orderData.orderedProducts[index]?.quantity * item.price}$
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            <div className="order-detail__products__list__cost d-flex flex-column py-3">
                                <p className="d-flex justify-content-end ">
                                    <span className="order-detail__products__list__cost__item d-flex justify-content-between">
                                        <span className="fw-bold">{t('order:subtotal')} </span>
                                        {orderData.orderedProducts &&
                                            orderData.orderedProducts.reduce((total, current, index) => {
                                                return total + current.quantity * orderedProductsData[index]?.price;
                                            }, 0)}
                                        $
                                    </span>
                                </p>
                                <p className="d-flex justify-content-end">
                                    <span className="order-detail__products__list__cost__item d-flex justify-content-between">
                                        <span className="fw-bold">{t('order:shippingCost')} </span>{' '}
                                        {orderData.shippingType.price}$
                                    </span>
                                </p>
                                <p className="d-flex justify-content-end">
                                    <span className="order-detail__products__list__cost__item d-flex justify-content-between">
                                        <span className="fw-bold">{t('order:total')} </span>
                                        {orderData.totalAmount}$
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-content-container">
                    <p className="text-center">No data</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default OrderDetail;
