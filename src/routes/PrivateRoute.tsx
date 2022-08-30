import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../helpers/hooks';
import { UserState } from '../models/user';
import { selectUser } from '../store/user/user.reducer';

interface IProps {
    children: JSX.Element;
}

const PrivateRoute = (props: IProps) => {
    const { user } = useAppSelector<UserState>(selectUser);
    if (user !== null) return props.children;
    else return <Navigate to={'/login'}></Navigate>;
};
export default PrivateRoute;
