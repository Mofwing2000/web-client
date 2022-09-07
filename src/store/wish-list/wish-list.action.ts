import { createAction, createAsyncAction } from 'typesafe-actions';
import { WishList } from '../../models/wish-list';
import { WishListActionType } from '../../type/wish-list-actions';

export const fetchWishListAsync = createAsyncAction(
    WishListActionType.FETCH_WISHLIST_START,
    WishListActionType.FETCH_WISHLIST_SUCCEED,
    WishListActionType.FETCH_WISHLIST_FAILED,
)<void, WishList, string>();

export const toggleWishListAsync = createAsyncAction(
    WishListActionType.TOGGLE_WISHLIST_START,
    WishListActionType.TOGGLE_WISHLIST_SUCCEED,
    WishListActionType.TOGGLE_WISHLIST_FAILED,
)<string, WishList, string>();

export const clearWishList = createAction(WishListActionType.CLEAR_WISHLIST)();
