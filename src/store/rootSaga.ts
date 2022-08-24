import { all } from '@redux-saga/core/effects';
import { authenticateSaga } from './auth/auth.saga';
import { cartSaga } from './cart/cart.saga';
import { collectionSaga } from './collection/collection.saga';
import { productSaga } from './product/product.saga';
import { wishListSaga } from './wish-list/wish-list.saga';

export default function* rootSaga() {
    yield all([authenticateSaga(), collectionSaga(), productSaga(), wishListSaga(), cartSaga()]);
}
