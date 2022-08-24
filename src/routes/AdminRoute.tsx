import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../helpers/hooks';
import AuthState from '../models/auth';
import { selectAuth } from '../store/root-reducer';

interface IProps {
    children: JSX.Element;
}

const AdminRoute = (props: IProps) => {
    const { userToken, currentUser } = useAppSelector<AuthState>(selectAuth);
    if (userToken !== null) {
        if (currentUser?.role === 'admin') return props.children;
        else return <Navigate to={'/'}></Navigate>;
    } else return <Navigate to={'/login'}></Navigate>;
};
export default AdminRoute;
