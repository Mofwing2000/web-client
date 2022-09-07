export interface CommentItem {
    id: string;
    userId: string;
    userName: string;
    avatar: string;
    content: string;
    createdAt: Date;
    rating: number;
}
export interface Comment {
    id: string;
    commentItemList: Array<CommentItem>;
}
