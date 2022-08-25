import React, { FC, memo, useMemo } from 'react';
import { Product } from '../../models/product';
import './product-item.scss';
import { DEFAULT_PRODUCT_PHOTO_URL as defaultPhotoImg } from '../../constants/commons';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
interface IProps {
    product: Product;
    onToggleWishList: React.MouseEventHandler<HTMLElement>;
    isLiked: boolean;
}

const ProductCard: FC<IProps> = (props) => {
    const { product, onToggleWishList, isLiked } = props;
    const dispatch = useDispatch();
    console.log('render');
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
                        style={{ backgroundImage: `url(${product.photoUrls[0]}), url(${defaultPhotoImg})` }}
                    ></div>
                </Link>
            </div>
            <div className="product-item__content">
                <Link to={`/product/${product.id}`}>
                    <p className="product-item__content__name product-item__content__text">{product.name}</p>
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
