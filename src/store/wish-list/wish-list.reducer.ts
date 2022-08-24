import { createReducer, Reducer } from 'typesafe-actions';
import AuthState from '../../models/auth';
import { ActionType } from 'typesafe-actions';
import { WishList, WishListState } from '../../models/wish-list';
import { WishListActionType } from '../../type/wish-list-actions';
import { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initState: WishListState = {
    wishList: null,
    isWishListLoading: false,
    error: '',
};

const wishListReducer: Reducer<WishListState, AnyAction> = createReducer(initState)
    .handleAction(WishListActionType.FETCH_WISHLIST_START, (state: WishListState) => ({
        ...state,
        isWishListLoading: true,
    }))
    .handleAction(
        WishListActionType.FETCH_WISHLIST_SUCCEED,
        (state: WishListState, action: PayloadAction<WishList>) => ({
            ...state,
            isWishListLoading: false,
            wishList: action.payload,
        }),
    )
    .handleAction(WishListActionType.FETCH_WISHLIST_FAILED, (state: WishListState, action: PayloadAction<string>) => ({
        ...state,
        isWishListLoading: false,
        error: action.payload,
    }))
    .handleAction(WishListActionType.TOGGLE_WISHLIST_START, (state: WishListState) => ({
        ...state,
        isWishListLoading: true,
    }))
    .handleAction(
        WishListActionType.TOGGLE_WISHLIST_SUCCEED,
        (state: WishListState, action: PayloadAction<WishList>) => ({
            ...state,
            isWishListLoading: false,
            wishList: action.payload,
        }),
    )
    .handleAction(WishListActionType.TOGGLE_WISHLIST_FAILED, (state: WishListState, action: PayloadAction<string>) => ({
        ...state,
        isWishListLoading: false,
        error: action.payload,
    }))
    .handleAction(WishListActionType.CLEAR_WISHLIST, (state: WishListState) => ({
        ...state,
        isWishListLoading: false,
        error: '',
        wishList: null,
    }));

export default wishListReducer;
export const selectWishList = (state: RootState) => state.wishList;
