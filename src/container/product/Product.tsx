import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc, query, collection, orderBy, onSnapshot, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { Top, Bottom, Color, Size } from '../../models/product';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { FreeMode, Navigation, Thumbs } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import { FirebaseError } from '@firebase/util';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../../models/cart';
import { addCartAsync } from '../../store/cart/cart.action';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import * as yup from 'yup';
import { DEFAULT_USER_PHOTO_URL as defaultPhotoImg } from '../../constants/commons';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '../../sass/common.scss';
import './product.scss';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Comment, CommentItem } from '../../models/comment';
import cuid from 'cuid';
import { firebaseRelativeDateFormat } from '../../helpers/common';
import { UserState } from '../../models/user';
import { selectUser } from '../../store/user/user.reducer';

interface CommentForm {
    content: string;
}

const Product = () => {
    const { t } = useTranslation(['common', 'product']);
    const schema = yup
        .object({
            content: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
        })
        .required();
    SwiperCore.use([Autoplay, Navigation, Thumbs]);
    const { productId } = useParams();
    const { user } = useAppSelector<UserState>(selectUser);
    const [productData, setProductData] = useState<Top | Bottom>();
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<Color>();
    const [selectedSize, setSelectedSize] = useState<Size>();
    const [selectQuantity, setSelectQuantity] = useState<number>(1);
    const [commentData, setCommentData] = useState<Comment>();
    const [currentIndex, setCurrentIndex] = useState<number>(5);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommentForm>({
        resolver: yupResolver(schema),
        defaultValues: { content: '' },
    });
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleColorSelect = useCallback((color: Color) => {
        setSelectedColor(color);
    }, []);

    const handleSizeSelect = useCallback((size: Size) => {
        setSelectedSize(size);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!user) {
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
            if (productData) {
                const cartItem: CartItem = {
                    id: productData.id,
                    quantity: selectQuantity,
                    color: selectedColor,
                    size: selectedSize,
                };
                dispatch(addCartAsync.request(cartItem));
            }
            return 1;
        }
    }, [selectedColor, selectedSize, selectQuantity, productData, user]);

    const unsub = useCallback(() => {
        if (productData) {
            console.log('unsub');
            const docRef = doc(db, 'comment', productData.id);
            onSnapshot(
                docRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        setCommentData(docSnap.data() as Comment);
                    } else {
                        const createDB = async () => {
                            try {
                                await setDoc(docRef, {
                                    id: productData.id,
                                    commentItemList: [],
                                });
                            } catch (error) {
                                if (error instanceof FirebaseError) {
                                    toast.error(error.message);
                                }
                            }
                        };
                        createDB();
                    }
                },
                (error) => {
                    if (error instanceof FirebaseError) toast.error(error.message);
                },
            );
        }
    }, [productData]);

    const bigSlide = useMemo(
        () =>
            productData &&
            productData.photoUrls.map((photo, index) => (
                <SwiperSlide className="product__main__gallery__slider__item " key={index}>
                    <div
                        className="product__main__gallery__slider__item__container square-div-with-background"
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
                <SwiperSlide className="product__main__gallery__slider__item" key={index}>
                    <div
                        className="product__main__gallery__slider__item__container square-div-with-background"
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
                            className={`product__main__info__color__item ${
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
                    className={`product__main__info__size__item ${size.isAvailable ? 'in-stock' : 'out-stock'} ${
                        size.sizeName === selectedSize && 'active'
                    }`}
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

    const sendComment = async (commentItem: CommentItem) => {
        console.log(commentItem);
        console.log(productData);

        if (productData) {
            const docRef = doc(db, 'comment', productData?.id);
            try {
                await runTransaction(db, async (transaction) => {
                    const sfDoc = await transaction.get(docRef);
                    if (sfDoc.exists()) {
                        console.log(commentItem);

                        const newComment = [...(sfDoc.data() as Comment).commentItemList, commentItem];
                        console.log(newComment);

                        transaction.update(docRef, { commentItemList: newComment });
                    }
                });
            } catch (error) {
                if (error instanceof FirebaseError) toast.error(error.message);
            }
        } else {
            console.log('asddfasfdas');
        }
    };

    const handleCommentDelete = useCallback(
        async (id: string) => {
            setIsLoading(true);
            if (productData) {
                console.log('asdffadsadfsfdas12312312');

                const docRef = doc(db, 'comment', productData!.id);
                try {
                    await runTransaction(db, async (transaction) => {
                        const sfDoc = await transaction.get(docRef);
                        if (sfDoc.exists()) {
                            const newComment = [
                                ...(sfDoc.data() as Comment).commentItemList.filter((item) => item.id !== id),
                            ];
                            transaction.update(docRef, { commentItemList: newComment });
                        }
                        setIsLoading(false);
                    });
                } catch (error) {
                    if (error instanceof FirebaseError) {
                        toast.error(error.message);
                        setIsLoading(false);
                    }
                }
            }
        },
        [productData],
    );

    const onSubmit: SubmitHandler<CommentForm> = useCallback(
        async (data) => {
            if (productData) {
                setIsLoading(true);
                console.log(productData);

                const commentItem: CommentItem = {
                    id: cuid(),
                    userId: user!.id,
                    userName: user!.firstName + ' ' + user!.lastName,
                    avatar: user!.photoUrl,
                    content: data.content,
                    createdAt: new Date(Date.now()),
                };
                console.log(commentItem);

                await sendComment(commentItem);
                setIsLoading(false);
                reset({
                    content: '',
                });
            }
        },
        [commentData],
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

    useEffect(() => {
        if (productData) {
            unsub();
        }
    }, [productData]);

    return (
        <>
            {productData ? (
                <div className="product position-relative my-5">
                    <div className="container">
                        <div className="product__main row gx-5">
                            <div className="product__main__gallery col-lg-6">
                                <div className="product__main__gallery__container">
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
                                <div className="product__main__gallery__slider mt-3">
                                    <Swiper
                                        onSwiper={setThumbsSwiper}
                                        // loop={true}
                                        spaceBetween={10}
                                        slidesPerView={4}
                                        freeMode={true}
                                        watchSlidesProgress={true}
                                        modules={[FreeMode, Navigation, Thumbs]}
                                        className="product__main__gallery__slider__container"
                                    >
                                        {smallSlide}
                                    </Swiper>
                                </div>
                            </div>
                            <div className="product__main__info col-lg-6 mt-xs-5">
                                <h2 className="product__main__info__title">{productData.name.toLocaleUpperCase()}</h2>
                                <div className="product__main__info__price">{productData.price + '$'}</div>
                                <div className="product__main__info__quantity mt-2">
                                    <span className="product__main__info__quantity">{t('product:quantity')}: </span>
                                    <span style={{ color: `${productData.quantity > 0 ? 'inherit' : '#e53637'}` }}>
                                        {productData.quantity > 0 ? productData.quantity : `${t('product:outOfStock')}`}
                                    </span>
                                </div>
                                <div className="product__main__info__color">{colorBar}</div>
                                <div className="product__main__info__size d-flex gap-2 mb-5 flex-wrap">{sizeBar}</div>
                                <div className="product__main__info__quantity-edit mb-3">
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
                                <div className="product__main__info__buttons d-flex gap-3">
                                    <button className="btn btn-lg btn-outline-danger" onClick={handleAddToCart}>
                                        {t('common:addToCart')}
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
                                        {t('common:buyNow')}
                                    </button>
                                </div>
                                <div className="product__main__info__description">
                                    <pre>
                                        <span className="product__main__info__description__label">
                                            {t('product:description')}:
                                        </span>
                                        <br />
                                        {productData.description}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="product__comment">
                            {user ? (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group">
                                        <label className="fs-4 mb-3" htmlFor="comment-textarea">
                                            {t('common:comment')}:
                                        </label>
                                        <textarea
                                            {...register('content')}
                                            className="product__comment__input form-control"
                                            id="comment-textarea"
                                            rows={3}
                                        ></textarea>
                                        <p className="text-danger">{errors.content?.message}</p>
                                    </div>
                                    <button className="btn btn-primary mt-3 " type="submit">
                                        {t('common:comment')}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <Link to="/login">{t('common:loginToComment')}</Link>
                                </div>
                            )}

                            <div className="mt-5">
                                <ul>
                                    {commentData && commentData.commentItemList.length ? (
                                        commentData.commentItemList.slice(0, currentIndex).map((commentItem, index) => (
                                            <li key={index} className="product__comment__item">
                                                <div className="product__comment__item__info d-flex gap-3 border-bottom mb-3 w-100">
                                                    <div className="d-flex flex-column flex-shrink-0">
                                                        <img
                                                            className="product__comment__item__info__avatar"
                                                            src={commentItem.avatar}
                                                            alt="user-avatar"
                                                            onError={({ currentTarget }) => {
                                                                if (currentTarget?.src) {
                                                                    currentTarget.src = defaultPhotoImg;
                                                                }
                                                            }}
                                                        ></img>
                                                        <p
                                                            className={`product__comment__item__info__user-name text-center mb-1 ${
                                                                commentItem.userId === user?.id ? 'text-primary' : ''
                                                            }`}
                                                        >
                                                            {commentItem.userName}
                                                        </p>
                                                        <p className="product__comment__item__info__date mb-1">
                                                            {firebaseRelativeDateFormat(commentItem.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="product__comment__item__main p-3 flex-grow-1">
                                                        <p className="product__comment__item__main__content ms-3">
                                                            {commentItem.content}
                                                        </p>
                                                        <button
                                                            className={`product__comment__item__main__btn btn btn-link ${
                                                                commentItem.userId === user?.id ? '' : 'd-none'
                                                            }`}
                                                            onClick={() => handleCommentDelete(commentItem.id)}
                                                        >
                                                            {t('common:delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <></>
                                    )}
                                    {commentData && (
                                        <p
                                            className={`text-primary text-center fs-5 ${
                                                currentIndex < commentData.commentItemList.length - 1 ? '' : 'd-none'
                                            }`}
                                            onClick={() => {
                                                if (currentIndex + 5 < commentData.commentItemList.length)
                                                    setCurrentIndex((prev) => prev + 5);
                                                else {
                                                    setCurrentIndex(
                                                        (prev) =>
                                                            prev +
                                                            (commentData.commentItemList.length - 1 - currentIndex),
                                                    );
                                                }
                                            }}
                                        >
                                            <u>{t('common:loadMore')}</u>
                                        </p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="product-profile text-center empty-content-container">
                    <p>{t('common:noData')}</p>
                </div>
            )}
            {isLoading && <LoadingModal />}
        </>
    );
};

export default memo(Product);
