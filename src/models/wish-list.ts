export interface WishList {
    id: string;
    productIdList: Array<string>;
}

export interface WishListState {
    isWishListLoading: boolean;
    wishList: WishList | null;
    error: string;
}
