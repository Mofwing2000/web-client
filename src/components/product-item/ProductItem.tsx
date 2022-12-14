import React, { FC, memo, useMemo } from 'react';
import { Product } from '../../models/product';
import { Link } from 'react-router-dom';

import { DEFAULT_PRODUCT_PHOTO_URL as defaultPhotoImg } from '../../constants/commons';
import './product-item.scss';

interface IProps {
    product: Product;
    onToggleWishList: React.MouseEventHandler<HTMLElement>;
    isLiked: boolean;
}

const ProductCard: FC<IProps> = (props) => {
    const { product, onToggleWishList, isLiked } = props;

    const colorsBar = useMemo(
        () =>
            product && (
                <div className="product-item__content__color me-5">
                    {product.color.map(
                        (color) =>
                            color.isAvailable && (
                                <span className="product-item__content__color__item " key={color.colorName}>
                                    <i
                                        className="fa-solid fa-circle"
                                        style={{ color: `${color.colorName.toLowerCase()}` }}
                                    ></i>
                                </span>
                            ),
                    )}
                </div>
            ),
        [product],
    );

    return (
        <div className="product-item mb-5 position-relative">
            <div className="product-item__pic">
                <Link to={`/product/${product.id}`}>
                    <div
                        className="product-item__pic__photo"
                        // style={{ backgroundImage: `url(${product.photoUrls[0]}), url(${defaultPhotoImg})` }}
                    >
                        <img
                            className="w-100 h-100"
                            src={`${product.photoUrls[0]}`}
                            alt="product-item"
                            onError={({ currentTarget }) => {
                                if (currentTarget?.src) {
                                    currentTarget.src = defaultPhotoImg;
                                }
                            }}
                        />
                    </div>
                </Link>
            </div>
            <div className="product-item__content d-block">
                <Link to={`/product/${product.id}`}>
                    <p className="product-item__content__name product-item__content__text  text-truncate">
                        {product.name}
                    </p>
                </Link>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="product-item__content__text fs-5 d-flex align-items-center m-0">${product.price}</p>
                    <>{colorsBar}</>
                </div>
            </div>
            <ul className="product-item__control">
                <li className="product-item__control__item">
                    <Link to={`../product/${product.id}`}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </Link>
                </li>
                <li className="product-item__control__item">
                    <i className={`fa-solid fa-heart ${isLiked && 'text-danger'}`} onClick={onToggleWishList}></i>
                </li>
            </ul>
        </div>
    );
};

export default memo(ProductCard);
