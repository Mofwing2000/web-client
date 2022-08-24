import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase.config';
import { Collection } from '../../models/collection';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import SwiperCore, { Autoplay } from 'swiper';
import './hero.scss';
import 'swiper/css/navigation';
import { Link, useNavigate } from 'react-router-dom';

interface IProps {
    collectionsData: Collection[];
}

const Hero: FC<IProps> = (props) => {
    const { collectionsData } = props;
    console.log(collectionsData);
    return (
        <div className="hero">
            <Swiper loop={true} modules={[Navigation]}>
                {collectionsData &&
                    collectionsData.map((item, index) => (
                        <SwiperSlide className="hero__swiper" key={index}>
                            <div
                                className="hero__swiper__item"
                                style={{
                                    backgroundImage: `url(${item.collectionBanner})`,
                                }}
                            >
                                <div className="h-100 container text-white">
                                    <div className="row h-100">
                                        <div className="h-100 col-xl-5 col-lg-7 col-md-8">
                                            <div className="h-100 hero__text position-relative">
                                                <h2 className="fw-bold fs-1 mb-5">{item.title}</h2>
                                                <p>{item.description}</p>
                                                <Link to={`./collection/${item.id}`}>
                                                    <span className="py-2 px-4 bg-black fs-5 d-inline-flex gap-3 align-items-center">
                                                        Shop now <i className="fa-solid fa-arrow-right-long"></i>
                                                    </span>
                                                </Link>

                                                <div className="hero__social position-absolute d-flex gap-5 ">
                                                    <a href="#" className="fs-5">
                                                        <i className="fa fa-facebook"></i>
                                                    </a>
                                                    <a href="#" className="fs-5">
                                                        <i className="fa fa-twitter"></i>
                                                    </a>
                                                    <a href="#" className="fs-5">
                                                        <i className="fa fa-pinterest"></i>
                                                    </a>
                                                    <a href="#" className="fs-5">
                                                        <i className="fa fa-instagram"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
            </Swiper>
        </div>
    );
};

export default memo(Hero);
