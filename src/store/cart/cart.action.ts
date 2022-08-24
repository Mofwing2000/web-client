import { DocumentData, DocumentReference } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Cart, CartItem } from '../../models/cart';
import { CartActionType } from '../../type/cart-actions';

export const fetchCartAsync = createAsyncAction(
    CartActionType.FETCH_CART_START,
    CartActionType.FETCH_CART_SUCCEED,
    CartActionType.FETCH_CART_FAILED,
)<void, Cart, string>();

export const addCartAsync = createAsyncAction(
    CartActionType.ADD_CART_START,
    CartActionType.ADD_CART_SUCCEED,
    CartActionType.ADD_CART_FAILED,
)<CartItem, Cart, string>();

export const removeCartAsync = createAsyncAction(
    CartActionType.REMOVE_CART_START,
    CartActionType.REMOVE_CART_SUCCEED,
    CartActionType.REMOVE_CART_FAILED,
)<CartItem, Cart, string>();

export const increaseCartAsync = createAsyncAction(
    CartActionType.INCREASE_CART_START,
    CartActionType.INCREASE_CART_SUCCEED,
    CartActionType.INCREASE_CART_FAILED,
)<CartItem, Cart, string>();

export const changeQuantityCartAsync = createAsyncAction(
    CartActionType.CHANGE_QUANTITY_CART_START,
    CartActionType.CHANGE_QUANTITY_CART_SUCCEED,
    CartActionType.CHANGE_QUANTITY_CART_FAILED,
)<{ cartItem: CartItem; newQuantity: number }, Cart, string>();

export const decreaseCartAsync = createAsyncAction(
    CartActionType.DECREASE_CART_START,
    CartActionType.DECREASE_CART_SUCCEED,
    CartActionType.DECREASE_CART_FAILED,
)<CartItem, Cart, string>();

export const clearCart = createAction(CartActionType.CLEAR_CART)();
