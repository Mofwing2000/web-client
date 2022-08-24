import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { push } from 'redux-first-history';
import auth, { db } from '../../config/firebase.config';
import { loginAsync, logout, signupAsync } from './auth.action';
import { DEFAULT_USER_PHOTO_URL as defaultAvatar } from '../../constants/commons';
import { User } from '../../models/user';
import { WishList } from '../../models/wish-list';
import { Cart } from '../../models/cart';

async function loginFirebase(email: string, password: string) {
    console.log(email, password);
    return signInWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        console.log(userCredential.user.uid);
        const userToken = await userCredential.user.getIdToken();
        const docRef = doc(db, 'user', userCredential.user.uid);
        const docSnap = await getDoc(docRef);
        console.log('logged');
        console.log({
            user: { ...docSnap.data() },
            token: userToken,
        });
        return {
            user: { ...docSnap.data() },
            token: userToken,
        };
    });
}

function* login(action: ReturnType<typeof loginAsync.request>) {
    try {
        const { email, password } = action.payload;
        const { user, token } = yield call(loginFirebase, email, password);
        yield put(loginAsync.success({ user, token }));
        yield put(push('/'));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(loginAsync.failure(error.message));
        }
    }
}

async function createNewUserWishList(uid: string) {
    await setDoc(doc(db, 'wishList', uid), {
        id: uid,
        productIdList: [],
    } as WishList);
}

async function createNewUserCart(uid: string) {
    await setDoc(doc(db, 'cart', uid), {
        id: uid,
        cartItems: [],
    } as Cart);
}

async function signupFirebase(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    address: string,
) {
    console.log(email, password, firstName, lastName, phoneNumber, address);
    return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        const docRef = doc(db, 'user', userCredential.user.uid);
        await setDoc(docRef, {
            id: userCredential.user.uid,
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            address,
            createdAt: new Date(Date.now()),
            photoUrl: defaultAvatar,
            role: 'customer',
        } as User);
        await createNewUserWishList(userCredential.user.uid);
        await createNewUserCart(userCredential.user.uid);
    });
}

function* signup(action: ReturnType<typeof signupAsync.request>) {
    try {
        const { email, password, firstName, lastName, confirmPassword, phoneNumber, address } = action.payload;
        yield call(signupFirebase, email, password, firstName, lastName, phoneNumber, address);
        yield put(push('/login'));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(signupAsync.failure(error.message));
        }
    }
}

export function* authenticateSaga() {
    yield takeEvery(loginAsync.request, login);
    yield takeEvery(signupAsync.request, signup);
}
