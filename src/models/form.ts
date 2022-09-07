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
