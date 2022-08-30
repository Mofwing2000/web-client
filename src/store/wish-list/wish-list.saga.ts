import { FirebaseError } from '@firebase/util';
import { call, put, select, takeEvery } from '@redux-saga/core/effects';
import { DocumentData, getDoc, getDocs, DocumentReference, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../../config/firebase.config';
import { User } from '../../models/user';
import { WishList } from '../../models/wish-list';
import { selectCart } from '../cart/cart.reducer';
import { selectAuth } from '../root-reducer';
import { selectUser } from '../user/user.reducer';
import { fetchWishListAsync, toggleWishListAsync } from './wish-list.action';
import { selectWishList } from './wish-list.reducer';

async function fetchWishList(id: string) {
    const querySnapShot = await getDoc(doc(db, 'wishList', id));
    if (querySnapShot.exists()) return querySnapShot.data() as WishList;
}

function* fetchWishListGen() {
    try {
        const { user }: ReturnType<typeof selectUser> = yield select(selectUser);
        if (user) {
            const wishList: WishList = yield call(fetchWishList, user.id);
            yield put(fetchWishListAsync.success(wishList));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchWishListAsync.failure(error.message));
        }
    }
}

async function toggleWishList(id: string, wishList: WishList) {
    const productsList = wishList.productIdList;
    let newProductsList: string[];
    if (wishList.productIdList.includes(id)) {
        newProductsList = wishList.productIdList.filter((product) => product !== id);
        await updateDoc(doc(db, 'wishList', wishList.id), {
            productIdList: [...newProductsList],
        });
        toast.success('Removed from wishList');
    } else {
        newProductsList = [...wishList.productIdList, id];
        await updateDoc(doc(db, 'wishList', wishList.id), {
            productIdList: [...newProductsList],
        });
        toast.success('Added from wishList');
    }
    return {
        ...wishList,
        productIdList: newProductsList,
    };
}

function* toggleWishListGen(action: ReturnType<typeof toggleWishListAsync.request>) {
    try {
        const productId = action.payload;
        const { wishList }: ReturnType<typeof selectWishList> = yield select(selectWishList);
        if (wishList) {
            const wishListData: WishList = yield call(toggleWishList, productId, wishList);
            yield put(toggleWishListAsync.success(wishListData));
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(toggleWishListAsync.failure(error.message));
        }
    }
}

export function* wishListSaga() {
    yield takeEvery(fetchWishListAsync.request, fetchWishListGen);
    yield takeEvery(toggleWishListAsync.request, toggleWishListGen);
}
