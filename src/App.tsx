import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAppSelector } from './helpers/hooks';
import MainLayout from './layout/MainLayout';
import { DisplayModeState } from './models/display-mode';
import Login from './pages/Login';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';
import { selectDarkMode } from './store/dark-mode/dark-mode.reducer';
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import './App.scss';
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';
import Home from './container/home/Home';
import WithSidebar from './layout/with-sidebar/WithSidebar';
import Catalog from './container/catalog/Catalog';
import Product from './container/product/Product';
import Cart from './container/cart/Cart';
import Checkout from './container/checkout/Checkout';
import CollectionPage from './container/collection/CollectionPage';
import WishListPage from './container/wish-list/WishList';
import SearchPage from './container/search/SearchPage';
import OrderPage from './container/order-page/OrderPage';

function App() {
    const { mode } = useAppSelector<DisplayModeState>(selectDarkMode);
    useEffect(() => {
        const body = document.getElementsByTagName('body')[0];
        if (mode === 'dark') body.style.backgroundColor = '#262626';
        else body.style.backgroundColor = 'unset';
    }, [mode]);
    return (
        <div className="app position-relative" data-theme={mode}>
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />}></Route>
                        <Route path=":type" element={<Catalog />}></Route>
                        <Route path="search" element={<SearchPage />}></Route>
                        <Route path="product/:productId" element={<Product />}></Route>
                        <Route path="collection/:collectionId" element={<CollectionPage />}></Route>
                        <Route path="about" element={<Home />}></Route>
                        <Route
                            path="shopping-cart"
                            element={
                                <PrivateRoute>
                                    <Cart />
                                </PrivateRoute>
                            }
                        ></Route>
                        <Route
                            path="checkout"
                            element={
                                <PrivateRoute>
                                    <Checkout />
                                </PrivateRoute>
                            }
                        ></Route>
                        <Route
                            path="wish-list"
                            element={
                                <PrivateRoute>
                                    <WishListPage />
                                </PrivateRoute>
                            }
                        ></Route>
                        <Route
                            path="order"
                            element={
                                <PrivateRoute>
                                    <OrderPage />
                                </PrivateRoute>
                            }
                        ></Route>
                    </Route>
                    <Route path="login" element={<Login />}></Route>
                    <Route path="forgot-password" element={<ForgotPassword />}></Route>
                    <Route path="signup" element={<Signup />}></Route>
                    {/* <StaffRoute path="admin" element={<Admin />}></StaffRoute> */}
                </Routes>
            </Suspense>

            <ToastContainer />
        </div>
    );
}

export default App;
