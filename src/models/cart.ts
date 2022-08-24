import { Color, Size } from './product';

export interface Cart {
    id: string;
    cartItems: Array<CartItem>;
}

export interface CartItem {
    id: string;
    quantity: number;
    color: Color;
    size: Size;
}

export interface CartState {
    isCartLoading: boolean;
    cart: Cart | null;
    error: string;
}
