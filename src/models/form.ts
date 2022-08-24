// import { UserRole } from '../type/UserType';

// export interface UserManageFormValues {
//     email: string;
//     firstName: string;
//     lastName: string;
//     password: string;
//     photoUrl: string;
//     phoneNumber: string;
//     address: string;
//     role: UserRole;
// }

export interface LoginInput {
    email: string;
    password: string;
}

export interface SignupInput {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    address: string;
}

export interface ForgotPasswordInput {
    email: string;
}
