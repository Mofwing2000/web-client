import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { AuthActionsType } from '../../type/auth';

const initialState: AuthState = {
    isAuthLoading: false,
    error: null,
    currentUser: null,
    userToken: null,
};

interface IAction {
    type: string;
    payload: any;
}

const authReducer: Reducer<AuthState, AnyAction> = createReducer(initialState)
    .handleAction(AuthActionsType.SIGNUP_START, (state: AuthState) => ({ ...state, isLoading: true }))
    .handleAction(AuthActionsType.SIGNUP_START_SUCCEED, (state: AuthState) => ({
        ...state,
        isLoading: false,
    }))
    .handleAction(AuthActionsType.SIGNUP_START_FAIL, (state: AuthState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(AuthActionsType.LOGIN_START, (state: AuthState) => ({ ...state, isLoading: true }))
    .handleAction(
        AuthActionsType.LOGIN_START_SUCCEED,
        (state: AuthState, action: PayloadAction<{ user: User; token: string }>) => ({
            ...state,
            isLoading: false,
            isLogged: true,
            currentUser: action.payload.user,
            userToken: action.payload.token,
        }),
    )
    .handleAction(AuthActionsType.LOGIN_START_FAIL, (state: AuthState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(AuthActionsType.LOGOUT, (state: AuthState) => ({
        ...state,
        isLoading: false,
        isLogged: false,
        currentUser: null,
        userToken: null,
        error: null,
    }));

export default authReducer;
