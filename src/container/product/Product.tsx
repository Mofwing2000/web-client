import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { Top, Bottom, Color, Size } from '../../models/product';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { FreeMode, Navigation, Thumbs } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import './product.scss';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../../models/cart';
import { addCartAsync } from '../../store/cart/cart.action';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { selectAuth } from '../../store/root-reducer';
import AuthState from '../../models/auth';

const Product = () => {
    const { t } = useTranslation(['common', 'product']);
    SwiperCore.use([Autoplay, Navigation, Thumbs]);
    const { productId } = useParams();
    const { currentUser } = useAppSelector<AuthState>(selectAuth);
    const [productData, setProductData] = useState<Top | Bottom>();
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<Color>();
    const [selectedSize, setSelectedSize] = useState<Size>();
    const [selectQuantity, setSelectQuantity] = useState<number>(1);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleColorSelect = useCallback((color: Color) => {
        setSelectedColor(color);
    }, []);

    const handleSizeSelect = useCallback((size: Size) => {
        setSelectedSize(size);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!currentUser) {
            navigate('/login');
            return 0;
        }
        if (!selectedColor) {
            toast.warning(`${t('common:selectOneColor')}`);
            return 0;
        } else if (!selectedSize) {
            toast.warning(`${t('common:selectOneSize')}`);
            return 0;
        } else {
            console.log(selectedColor, selectedSize, selectQuantity, productData);
            if (productData) {
                const cartItem: CartItem = {
                    id: productData.id,
                    quantity: selectQuantity,
                    color: selectedColor,
                    size: selectedSize,
                };
                console.log(cartItem);
                dispatch(addCartAsync.request(cartItem));
            }
            return 1;
        }
    }, [selectedColor, selectedSize, selectQuantity, productData, currentUser]);

    console.log(selectedColor);

    const bigSlide = useMemo(
        () =>
            productData &&
            productData.photoUrls.map((photo, index) => (
                <SwiperSlide className="product-profile__main__gallery__slider__item" key={index}>
                    <div
                        className="product-profile__main__gallery__slider__item__container"
                        style={{
                            backgroundImage: `url(${photo})`,
                        }}
                    ></div>
                </SwiperSlide>
            )),
        [productData],
    );

    const smallSlide = useMemo(
        () =>
            productData &&
            productData.photoUrls.map((photo, index) => (
                <SwiperSlide className="product-profile__main__gallery__slider__item" key={index}>
                    <div
                        className="product-profile__main__gallery__slider__item__container"
                        style={{
                            backgroundImage: `url(${photo})`,
                        }}
                    ></div>
                </SwiperSlide>
            )),
        [productData],
    );

    const colorBar = useMemo(
        () =>
            productData &&
            productData.color.map(
                (color) =>
                    color.isAvailable && (
                        <span
                            className={`product-profile__main__info__color__item ${
                                color.colorName === selectedColor && 'active'
                            }`}
                            key={color.colorName}
                            onClick={() => {
                                if (color.isAvailable) handleColorSelect(color.colorName);
                            }}
                        >
                            <i className="fa-solid fa-circle" style={{ color: `${color.colorName.toLowerCase()}` }}></i>
                        </span>
                    ),
            ),
        [productData, selectedColor],
    );

    const sizeBar = useMemo(
        () =>
            productData &&
            productData.size.map((size) => (
                <span
                    className={`product-profile__main__info__size__item ${
                        size.isAvailable ? 'in-stock' : 'out-stock'
                    } ${size.sizeName === selectedSize && 'active'}`}
                    key={size.sizeName}
                    onClick={() => {
                        if (size.isAvailable) handleSizeSelect(size.sizeName);
                    }}
                >
                    {size.sizeName}
                </span>
            )),
        [productData, selectedSize],
    );

    const handleDecreaseQuantity = useCallback(() => {
        if (productData) {
            if (selectQuantity >= 2) setSelectQuantity(selectQuantity - 1);
        }
    }, [selectQuantity, productData]);

    const handleIncreaseQuantity = useCallback(() => {
        if (productData) {
            if (selectQuantity < productData.quantity) setSelectQuantity(selectQuantity + 1);
        }
    }, [selectQuantity, productData]);

    const handleQuantityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (productData) {
                if (+e.target.value > productData.quantity) setSelectQuantity(productData.quantity);
                else if (+e.target.value < 1) setSelectQuantity(1);
                else setSelectQuantity(+e.target.value);
            }
        },
        [productData],
    );

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const docRef = doc(db, 'product', productId as string);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setProductData(docSnap.data() as Top | Bottom);
                setIsLoading(false);
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <>
            {productData ? (
                <div className="product-profile position-relative my-5">
                    <div className="container">
                        <div className="product-profile__main row gx-5">
                            <div className="product-profile__main__gallery col-lg-6">
                                <div className="product-profile__main__gallery__container">
                                    <Swiper
                                        // loop={true}
                                        spaceBetween={10}
                                        thumbs={{
                                            swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                                        }}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                    >
                                        {bigSlide}
                                    </Swiper>
                                </div>
                                <div className="product-profile__main__gallery__slider mt-3">
                                    <Swiper
                                        onSwiper={setThumbsSwiper}
                                        // loop={true}
                                        spaceBetween={10}
                                        slidesPerView={4}
                                        freeMode={true}
                                        watchSlidesProgress={true}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                        className="product-profile__main__gallery__slider__container"
                                    >
                                        {smallSlide}
                                    </Swiper>
                                </div>
                            </div>
                            <div className="product-profile__main__info col-lg-6 mt-xs-5">
                                <h2 className="product-profile__main__info__title">
                                    {productData.name.toLocaleUpperCase()}
                                </h2>
                                <div className="product-profile__main__info__price">{productData.price + '$'}</div>
                                <div className="product-profile__main__info__quantity mt-2">
                                    <span className="product-profile__main__info__quantity">
                                        {t('product:quantity')}:{' '}
                                    </span>
                                    <span style={{ color: `${productData.quantity > 0 ? 'inherit' : '#e53637'}` }}>
                                        {productData.quantity > 0 ? productData.quantity : `${t('product:outOfStock')}`}
                                    </span>
                                </div>
                                <div className="product-profile__main__info__color">{colorBar}</div>
                                <div className="product-profile__main__info__size d-flex gap-2 mb-5 flex-wrap">
                                    {sizeBar}
                                </div>
                                <div className="product-profile__main__info__quantity-edit mb-3">
                                    <span
                                        className="number-minus text-center font-weight-bold d-flex justify-content-center align-items-center "
                                        onClick={handleDecreaseQuantity}
                                    >
                                        -
                                    </span>
                                    <input
                                        type="number"
                                        className="number-input text-center border-right-0 border-left-0 d-flex justify-content-center align-items-center"
                                        name="quantity"
                                        value={selectQuantity}
                                        min="1"
                                        max={productData.quantity}
                                        onChange={handleQuantityChange}
                                    />
                                    <span
                                        className="number-plus text-center font-weight-bold d-inline-block d-flex justify-content-center align-items-center"
                                        onClick={handleIncreaseQuantity}
                                    >
                                        +
                                    </span>
                                </div>
                                <div className="product-profile__main__info__buttons d-flex gap-3">
                                    <button className="btn btn-lg btn-outline-danger" onClick={handleAddToCart}>
                                        Add to cart
                                    </button>
                                    <button
                                        className="btn btn-lg btn-danger"
                                        onClick={() => {
                                            if (handleAddToCart())
                                                setTimeout(() => {
                                                    navigate('/shopping-cart');
                                                }, 500);
                                        }}
                                    >
                                        Buy now
                                    </button>
                                </div>
                                <div className="product-profile__main__info__description">
                                    <pre>
                                        <span className="product-profile__main__info__description__label">
                                            {t('product:description')}:
                                        </span>
                                        <br />
                                        {productData.description}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="product-profile text-center">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(Product);
