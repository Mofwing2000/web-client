import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch } from '../helpers/hooks';
import { SignupInput } from '../models/form';
import { signupAsync } from '../store/auth/auth.action';

const Signup = () => {
    const { t } = useTranslation(['common', 'user']);
    const schema = yup
        .object({
            email: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .email(`${t('common:validEmail')}`),
            firstName: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(/^[a-zA-Z ]+$/, `${t('common:noNumberAllow')}`),
            lastName: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(/^[a-zA-Z ]+$/, `${t('common:noNumberAllow')}`),
            password: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .min(8, `${t('common:validPasswordLength')}`),
            confirmPassword: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .min(8, `${t('common:validPasswordLength')}`)
                .oneOf([yup.ref('password')], `${t('common:mustMatchPassword')}`),
            phoneNumber: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`)
                .matches(
                    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
                    `${t('common:validPhoneNumber')}`,
                ),
            address: yup
                .string()
                .trim()
                .required(`${t('common:requiredMessage')}`),
        })
        .required();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupInput>({
        resolver: yupResolver(schema),
    });

    const dispatch = useAppDispatch();

    // const onSubmit = handleSubmit((data) => console.log(data));
    const onSubmit = (data: SignupInput) => {
        dispatch(signupAsync.request(data));
    };
    const [formValues, setFormValues] = useState<SignupInput>({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        address: '',
    });

    const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            email: e.target.value,
        });
    };

    const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            password: e.target.value,
        });
    };

    const handleConfirmPasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            confirmPassword: e.target.value,
        });
    };

    const handleFirstNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            firstName: e.target.value,
        });
    };

    const handleLastNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            lastName: e.target.value,
        });
    };

    const handlePhoneNumberOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            phoneNumber: e.target.value,
        });
    };

    const handleAddressOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            ...formValues,
            address: e.target.value,
        });
    };

    return (
        <div className="wrapper">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong">
                            <form className="card-body p-5 " onSubmit={handleSubmit(onSubmit)} noValidate>
                                <h3 className="mb-5">Sign in</h3>
                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        value={formValues.email}
                                        type="email"
                                        id="email"
                                        className="form-control form-control-lg"
                                        {...register('email', {
                                            onChange: handleEmailOnChange,
                                        })}
                                    />
                                    {<p className="text-danger">{errors.email?.message}</p>}
                                </div>

                                <div className="row">
                                    <div className="form-outline mb-4  col-6">
                                        <label className="form-label" htmlFor="firstName">
                                            {t('user:firstName')}
                                        </label>
                                        <input
                                            value={formValues.firstName}
                                            type="text"
                                            id="firstName"
                                            className="form-control form-control-lg"
                                            {...register('firstName', {
                                                onChange: handleFirstNameOnChange,
                                            })}
                                        />
                                        {<p className="text-danger">{errors.firstName?.message}</p>}
                                    </div>

                                    <div className="form-outline mb-4 col-6">
                                        <label className="form-label" htmlFor="lastName">
                                            {t('user:lastName')}
                                        </label>
                                        <input
                                            value={formValues.lastName}
                                            type="text"
                                            id="lastName"
                                            className="form-control form-control-lg"
                                            {...register('lastName', {
                                                onChange: handleLastNameOnChange,
                                            })}
                                        />
                                        {<p className="text-danger">{errors.lastName?.message}</p>}
                                    </div>
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="password">
                                        {t('user:password')}
                                    </label>
                                    <input
                                        value={formValues.password}
                                        type="password"
                                        id="password"
                                        className="form-control form-control-lg"
                                        {...register('password', {
                                            onChange: handlePasswordOnChange,
                                        })}
                                    />
                                    <p className="text-danger">{errors.password?.message}</p>
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="confirmPassword">
                                        {t('user:confirmPassword')}
                                    </label>
                                    <input
                                        value={formValues.confirmPassword}
                                        type="password"
                                        id="confirmPassword"
                                        className="form-control form-control-lg"
                                        {...register('confirmPassword', {
                                            onChange: handleConfirmPasswordOnChange,
                                        })}
                                    />
                                    <p className="text-danger">{errors.confirmPassword?.message}</p>
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="phoneNumber">
                                        {t('user:phoneNumber')}
                                    </label>
                                    <input
                                        value={formValues.phoneNumber}
                                        type="text"
                                        id="phoneNumber"
                                        className="form-control form-control-lg"
                                        {...register('phoneNumber', {
                                            onChange: handlePhoneNumberOnChange,
                                        })}
                                    />
                                    <p className="text-danger">{errors.phoneNumber?.message}</p>
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="address">
                                        {t('user:address')}
                                    </label>
                                    <input
                                        value={formValues.address}
                                        type="text"
                                        id="address"
                                        className="form-control form-control-lg"
                                        {...register('address', {
                                            onChange: handleAddressOnChange,
                                        })}
                                    />
                                    <p className="text-danger">{errors.address?.message}</p>
                                </div>

                                <div className="justify-content-start mb-4">
                                    <Link to="/login">{t('common:alreadyHaveAccount')}</Link>
                                </div>
                                <div className="mb-4 text-center">
                                    <Link className="text-decoration-none text-danger" to={'/forgot-password'}>
                                        {t('common:forgotPassword')}
                                    </Link>
                                </div>

                                <button className="btn btn-primary btn-lg btn-block d-block mx-auto" type="submit">
                                    {t('common:signup')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
