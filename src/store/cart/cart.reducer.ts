import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { Cart, CartState } from '../../models/cart';
import { CartActionType } from '../../type/cart-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: CartState = {
    cart: null,
    isCartLoading: false,
    error: '',
};

const cartReducer: Reducer<CartState, AnyAction> = createReducer(initState)
    .handleAction(CartActionType.FETCH_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.FETCH_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.FETCH_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.ADD_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.ADD_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.ADD_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.REMOVE_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.REMOVE_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.REMOVE_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.INCREASE_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.INCREASE_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.INCREASE_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.CHANGE_QUANTITY_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.CHANGE_QUANTITY_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.CHANGE_QUANTITY_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.DECREASE_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.DECREASE_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.DECREASE_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }))
    .handleAction(CartActionType.CLEAR_CART_START, (state: CartState) => ({
        ...state,
        isLoading: true,
    }))
    .handleAction(CartActionType.CLEAR_CART_SUCCEED, (state: CartState, action: PayloadAction<Cart>) => ({
        ...state,
        isLoading: false,
        cart: action.payload,
    }))
    .handleAction(CartActionType.CLEAR_CART_FAILED, (state: CartState, action: PayloadAction<string>) => ({
        ...state,
        isLoading: false,
        error: action.payload,
    }));

export default cartReducer;
export const selectCart = (state: RootState) => state.cart;
