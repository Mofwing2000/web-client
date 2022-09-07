import { UserRole } from '../type/user-type';

export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photoUrl: string;
    address: string;
    role: UserRole;
    createdAt: Date;
}

export interface UserState {
    user: User | null;
    isUserLoading: boolean;
    error: string;
}

// export default type User = Omit<UserDataFirebase,'id'>
// export type User = Omit<UserDataFirebase, 'id'>;
