import { FirebaseError } from '@firebase/util';
import { call, put, select, takeEvery, take, takeLatest } from '@redux-saga/core/effects';
import { DocumentData, getDoc, getDocs, DocumentReference, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import AuthState from '../../models/auth';
import { Cart, CartItem } from '../../models/cart';
import { User } from '../../models/user';
import { selectAuth } from '../root-reducer';
import { selectUser } from '../user/user.reducer';
import {
    addCartAsync,
    changeQuantityCartAsync,
    clearCartAsync,
    decreaseCartAsync,
    fetchCartAsync,
    increaseCartAsync,
    removeCartAsync,
} from './cart.action';
import { selectCart } from './cart.reducer';

async function fetchCart(id: string) {
    const querySnapShot = await getDoc(doc(db, 'cart', id));
    if (querySnapShot.exists()) return querySnapShot.data() as Cart;
}

function* fetchCartGen() {
    try {
        const { user }: ReturnType<typeof selectUser> = yield select(selectUser);
        const wishList: Cart = yield call(fetchCart, (user as User).id);
        yield put(fetchCartAsync.success(wishList));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchCartAsync.failure(error.message));
        }
    }
}

async function addCart(cartItem: CartItem, cart: Cart) {
    const newCartItems = [...cart.cartItems, cartItem];
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [...newCartItems],
    });
    return {
        ...cart,
        cartItems: newCartItems,
    };
}

function* addCartGen(action: ReturnType<typeof addCartAsync.request>) {
    try {
        const cartItem = action.payload;
        // const { user } = yield select(selectAuth);
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            if (
                cart.cartItems.findIndex(
                    (item) => item.id === cartItem.id && item.color === cartItem.color && item.size === cartItem.size,
                ) !== -1
            ) {
                toast.warning('Product in cart already');
                yield put(addCartAsync.success(cart));
            } else {
                const cartData: Cart = yield call(addCart, cartItem, cart);
                toast.success('Added to cart');
                yield put(addCartAsync.success(cartData));
            }
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(addCartAsync.failure(error.message));
        }
    }
}

async function removeCart(cartItem: CartItem, cart: Cart) {
    const newCartItems = cart.cartItems.filter((item) => JSON.stringify(item) !== JSON.stringify(cartItem));
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [...newCartItems],
    });
    return {
        ...cart,
        cartItems: newCartItems,
    };
}

function* removeCartGen(action: ReturnType<typeof removeCartAsync.request>) {
    try {
        const cartItem = action.payload;
        // const { user } = yield select(selectAuth);
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            const cartData: Cart = yield call(removeCart, cartItem, cart);
            toast.warning('Product removed from cart');
            yield put(removeCartAsync.success(cartData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(removeCartAsync.failure(error.message));
        }
    }
}

async function increaseCart(cartItem: CartItem, cart: Cart) {
    const index = cart.cartItems.findIndex(
        (item) => item.id === cartItem.id && item.color === cartItem.color && item.size === cartItem.size,
    );
    const newCartItems = [...cart.cartItems];
    newCartItems.splice(index, 1, { ...newCartItems[index], quantity: newCartItems[index].quantity + 1 });
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [...newCartItems],
    });
    return {
        ...cart,
        cartItems: newCartItems,
    };
}

function* increaseCartGen(action: ReturnType<typeof increaseCartAsync.request>) {
    try {
        const cartItem = action.payload;
        // const { user } = yield select(selectAuth);
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            const cartData: Cart = yield call(increaseCart, cartItem, cart);
            yield put(increaseCartAsync.success(cartData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(increaseCartAsync.failure(error.message));
        }
    }
}

async function changeQuantityCart(cartItem: CartItem, newQuantity: number, cart: Cart) {
    const index = cart.cartItems.findIndex(
        (item) => item.id === cartItem.id && item.color === cartItem.color && item.size === cartItem.size,
    );
    const newCartItems = [...cart.cartItems];
    newCartItems.splice(index, 1, { ...newCartItems[index], quantity: newQuantity });
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [...newCartItems],
    });
    return {
        ...cart,
        cartItems: newCartItems,
    };
}

function* changeQuantityCartGen(action: ReturnType<typeof changeQuantityCartAsync.request>) {
    try {
        const { cartItem, newQuantity } = action.payload;
        // const { user } = yield select(selectAuth);
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            const cartData: Cart = yield call(changeQuantityCart, cartItem, newQuantity, cart);
            yield put(changeQuantityCartAsync.success(cartData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(changeQuantityCartAsync.failure(error.message));
        }
    }
}

async function decreaseCart(cartItem: CartItem, cart: Cart) {
    const index = cart.cartItems.findIndex(
        (item) => item.id === cartItem.id && item.color === cartItem.color && item.size === cartItem.size,
    );
    const newCartItems = [...cart.cartItems];
    newCartItems.splice(index, 1, { ...newCartItems[index], quantity: newCartItems[index].quantity - 1 });
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [...newCartItems],
    });
    return {
        ...cart,
        cartItems: newCartItems,
    };
}

function* decreaseCartGen(action: ReturnType<typeof decreaseCartAsync.request>) {
    try {
        const cartItem = action.payload;
        // const { user } = yield select(selectAuth);
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            const cartData: Cart = yield call(decreaseCart, cartItem, cart);
            yield put(decreaseCartAsync.success(cartData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(decreaseCartAsync.failure(error.message));
        }
    }
}

async function clearCart(cart: Cart) {
    await updateDoc(doc(db, 'cart', cart.id), {
        cartItems: [],
    });
    return {
        ...cart,
        cartItems: [],
    };
}

function* clearCartGen() {
    try {
        const { cart }: ReturnType<typeof selectCart> = yield select(selectCart);
        if (cart) {
            const cartData: Cart = yield call(clearCart, cart);
            yield put(clearCartAsync.success(cartData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(clearCartAsync.failure(error.message));
        }
    }
}

export function* cartSaga() {
    yield takeEvery(fetchCartAsync.request, fetchCartGen);
    yield takeEvery(addCartAsync.request, addCartGen);
    yield takeEvery(removeCartAsync.request, removeCartGen);
    yield takeLatest(increaseCartAsync.request, increaseCartGen);
    yield takeLatest(decreaseCartAsync.request, decreaseCartGen);
    yield takeLatest(changeQuantityCartAsync.request, changeQuantityCartGen);
    yield takeLatest(clearCartAsync.request, clearCartGen);
}
