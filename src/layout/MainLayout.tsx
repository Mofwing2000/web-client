import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import { useAppSelector } from '../helpers/hooks';
import './main-layout.scss';
import { UserState } from '../models/user';
import { selectUser } from '../store/user/user.reducer';
const MainLayout = () => {
    const { user } = useAppSelector<UserState>(selectUser);

    return (
        <>
            <Header />
            <main className="main">
                <Outlet context={user} />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
