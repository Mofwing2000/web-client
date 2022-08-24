import { DocumentData, DocumentReference, Query } from 'firebase/firestore';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { Collection } from '../../models/collection';
import { CollectionActionType } from '../../type/collection-actions';

export const fetchColllectionsAsync = createAsyncAction(
    CollectionActionType.FETCH_COLLECTIONS_START,
    CollectionActionType.FETCH_COLLECTIONS_SUCCEED,
    CollectionActionType.FETCH_COLLECTIONS_FAILED,
)<Query<DocumentData>, Array<Collection>, string>();

export const clearCollection = createAction(CollectionActionType.CLEAR_COLLECTION)();
