import { User } from './user';
export default interface AuthState {
    isAuthLoading: boolean;
    error: string | null;
    currentUser: User | null;
    userToken: string | null;
}
