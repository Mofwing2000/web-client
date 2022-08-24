import { FirebaseError } from '@firebase/util';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { DocumentData, getDocs, Query, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Collection } from '../../models/collection';
import { fetchColllectionsAsync } from './collection.action';

async function fetchColllections(dataQuery: Query<DocumentData>) {
    const list: Collection[] = [];
    const querySnapShot = await getDocs(dataQuery);
    querySnapShot.forEach((docItem) => {
        list.push(docItem.data() as Collection);
    });
    return list;
}

function* fetchColllectionsGen(action: ReturnType<typeof fetchColllectionsAsync.request>) {
    try {
        const fetchQuery = action.payload;
        const list: Collection[] = yield call(fetchColllections, fetchQuery);
        yield put(fetchColllectionsAsync.success(list));
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast.error(error.message);
            yield put(fetchColllectionsAsync.failure(error.message));
        }
    }
}

export function* collectionSaga() {
    yield takeEvery(fetchColllectionsAsync.request, fetchColllectionsGen);
}
