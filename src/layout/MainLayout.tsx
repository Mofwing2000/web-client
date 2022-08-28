import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import { useAppSelector } from '../helpers/hooks';
import { selectAuth } from '../store/root-reducer';
import SideBar from '../components/sidebar/SideBar';
import './main-layout.scss';
import AuthState from '../models/auth';
const MainLayout = () => {
    const { currentUser, isAuthLoading } = useAppSelector<AuthState>(selectAuth);

    return (
        <>
            <Header />
            <main className="pt-0 pt-md-auto">
                <Outlet context={currentUser} />
            </main>
            <Footer />

            {/* <Routes>
                <Route path="/dashboard" element={<DashBoard />}></Route>
                <Route path="/user" element={<User />}></Route>
            </Routes> */}
        </>
    );
};

export default MainLayout;
