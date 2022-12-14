import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import AuthState from '../../models/auth';
import { SignupInput } from '../../models/form';
import { signupAsync } from '../../store/auth/auth.action';
import { selectAuth } from '../../store/root-reducer';
import './signup.scss';
const Signup = () => {
    const { t } = useTranslation(['common', 'user']);
    const navigate = useNavigate();
    const { userToken } = useAppSelector<AuthState>(selectAuth);

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

    const handleEmailOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                email: e.target.value,
            };
        });
    }, []);

    const handlePasswordOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                password: e.target.value,
            };
        });
    }, []);

    const handleConfirmPasswordOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                confirmPassword: e.target.value,
            };
        });
    }, []);

    const handleFirstNameOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                firstName: e.target.value,
            };
        });
    }, []);

    const handleLastNameOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                lastName: e.target.value,
            };
        });
    }, []);

    const handlePhoneNumberOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                phoneNumber: e.target.value,
            };
        });
    }, []);

    const handleAddressOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => {
            return {
                ...prev,
                address: e.target.value,
            };
        });
    }, []);

    useEffect(() => {
        if (userToken) navigate('/');
    }, [userToken]);

    return (
        <div className="wrapper vh-100 wh-100">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong">
                            <form className="card-body p-5 " onSubmit={handleSubmit(onSubmit)} noValidate>
                                <h3 className="mb-3 text-center">{t('common:signup')}</h3>
                                <div className="form-outline mb-3">
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
                                    <div className="form-outline mb-3  col-6">
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

                                    <div className="form-outline mb-3 col-6">
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

                                <div className="form-outline mb-3">
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

                                <div className="form-outline mb-3">
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

                                <div className="form-outline mb-3">
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

                                <div className="form-outline mb-3">
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

                                <div className="justify-content-start mb-3">
                                    <Link to="/login">{t('common:alreadyHaveAccount')}</Link>
                                </div>
                                <div className="mb-3 text-center">
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
