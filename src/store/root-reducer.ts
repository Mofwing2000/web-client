import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer';
import routerReducer from './router/router-reducer';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { RootState } from './store';
import darkModeReducer from './dark-mode/dark-mode.reducer';
import collectionReducer from './collection/collection.reducer';
import productReducer from './product/product.reducer';
import wishListReducer from './wish-list/wish-list.reducer';
import cartReducer from './cart/cart.reducer';
import userReducer from './user/user.reducer';

const authPersistConfig = {
    key: 'auth',
    storage: storage,
    whitelist: ['currentUser', 'userToken', 'isLogged'],
};

const darkModePersistConfig = {
    key: 'darkMode',
    storage: storage,
};

const userPersistConfig = {
    key: 'user',
    storage: storage,
    whiteList: ['user'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    darkMode: persistReducer(darkModePersistConfig, darkModeReducer),
    product: productReducer,
    wishList: wishListReducer,
    collection: collectionReducer,
    cart: cartReducer,
    router: routerReducer,
    user: persistReducer(userPersistConfig, userReducer),
});

export default rootReducer;
export const selectAuth = (state: RootState) => state.auth;
