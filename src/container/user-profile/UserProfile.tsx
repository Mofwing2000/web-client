import { FirebaseError } from '@firebase/util';
import { yupResolver } from '@hookform/resolvers/yup';
import cuid from 'cuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import LoadingModal from '../../components/loading-modal/LoadingModal';
import { storage } from '../../config/firebase.config';
import { DEFAULT_USER_PHOTO_URL as defaultPhotoUrl } from '../../constants/commons';
import { useAppDispatch, useAppSelector } from '../../helpers/hooks';
import { User, UserState } from '../../models/user';
import { fetchUserAsync, updateUserAsync } from '../../store/user/user.action';
import { selectUser } from '../../store/user/user.reducer';
import './user-profile.scss';

interface FormValue {
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber: string;
    address: string;
}

const UserManagePanel = () => {
    const { user, isUserLoading } = useAppSelector<UserState>(selectUser);
    const { t } = useTranslation(['common', 'user']);
    const dispatch = useAppDispatch();
    const schema = yup
        .object({
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

    const [avatar, setAvatar] = useState<File>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const userFormValueData = useMemo(() => {
        if (user)
            return {
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
                phoneNumber: user.phoneNumber,
                address: user.address,
            };
    }, [user]);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValue>({
        resolver: yupResolver(schema),
        defaultValues: { ...userFormValueData },
    });
    const [userFormValue, setUserFormValue] = useState<User>({ ...user! });

    function isFileImage(file: File) {
        return file && file.type.split('/')[0] === 'image';
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue({
            ...userFormValue,
            password: e.target.value,
        });
    };

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue({
            ...userFormValue,
            firstName: e.target.value,
        });
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue({
            ...userFormValue,
            lastName: e.target.value,
        });
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue({
            ...userFormValue,
            phoneNumber: e.target.value,
        });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormValue({
            ...userFormValue,
            address: e.target.value,
        });
    };

    const uploadAvatar = async () => {
        if (avatar) {
            setIsLoading(true);
            const avatarFileName = cuid() + avatar.name;
            const storageRef = ref(storage, `userPhotos/${avatarFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, avatar);
            uploadTask.on(
                'state_changed',
                () => {},
                (error) => {
                    setIsLoading(false);
                    if (error instanceof FirebaseError) toast(error.message);
                },
                async () => {
                    await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setUserFormValue((prev) => {
                            return {
                                ...prev,
                                photoUrl: downloadURL,
                            };
                        });
                    });
                    setIsLoading(false);
                },
            );
        }
    };

    useEffect(() => {
        uploadAvatar();
    }, [avatar]);

    // useEffect(() => {
    //     if (formState.isSubmitSuccessful) {
    //         reset({ ...user });
    //     }
    // }, [formState, userFormValue, reset]);
    const onSubmit = async () => {
        dispatch(updateUserAsync.request(userFormValue));
    };
    return (
        <>
            {user && (
                <div className="manage-user card">
                    <form className="manage-user__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="manage-user__form__upload">
                            <div
                                className="manage-user__form__upload__img overflow-hidden d-flex justify-content-center align-items-center"
                                style={{
                                    backgroundImage: `url(${
                                        userFormValue.photoUrl || user.photoUrl || defaultPhotoUrl
                                    })`,
                                }}
                            ></div>
                            <div className="manage-user__form__upload__control ">
                                <div className="manage-user__form__upload__control__btn text-danger form-group">
                                    <label htmlFor="upload">
                                        <i className="fa-solid fa-upload"></i>
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control d-none"
                                        id="upload"
                                        onChange={(e) =>
                                            isFileImage(e.target.files![0]) && setAvatar(e.target.files![0])
                                        }
                                        aria-describedby="upload"
                                    />
                                </div>
                                <button className="manage-user__form__upload__control__btn text-danger ">
                                    <i className="fa-solid fa-user-pen"></i>
                                </button>
                            </div>
                        </div>
                        <div className="manage-user__form__upload row d-flex">
                            <div className="form-group col-6">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={userFormValue.email}
                                    aria-describedby="email"
                                    placeholder="abc@gmail.com"
                                    disabled
                                />
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="password">{t('user:password')}:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    // defaultValue={user.password}
                                    value={userFormValue.password}
                                    aria-describedby="password"
                                    {...register('password', {
                                        onChange: handlePasswordChange,
                                    })}
                                    placeholder="8 characters at least"
                                />
                                <p>{errors.password?.message}</p>
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="firstName">{t('user:firstName')}:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="firstName"
                                    // defaultValue={user.firstName}
                                    value={userFormValue.firstName}
                                    aria-describedby="fist name"
                                    placeholder="John"
                                    {...register('firstName', {
                                        onChange: handleFirstNameChange,
                                    })}
                                />
                                {<p>{errors.firstName?.message}</p>}
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="lastName">{t('user:lastName')}:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="lastName"
                                    // defaultValue={user.lastName}
                                    value={userFormValue.lastName}
                                    aria-describedby="last name"
                                    placeholder="Wick"
                                    {...register('lastName', {
                                        onChange: handleLastNameChange,
                                    })}
                                />
                                {<p>{errors.lastName?.message}</p>}
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="phone">{t('user:phoneNumber')}:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="phone"
                                    // defaultValue={user.phoneNumber}
                                    value={userFormValue.phoneNumber}
                                    aria-describedby="phone number"
                                    placeholder="0921341215"
                                    {...register('phoneNumber', {
                                        onChange: handlePhoneNumberChange,
                                    })}
                                />
                                <p>{errors.phoneNumber?.message}</p>
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="address">{t('user:address')}:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="address"
                                    // defaultValue={user.address}
                                    value={userFormValue.address}
                                    aria-describedby="address"
                                    placeholder="Hanoi"
                                    {...register('address', {
                                        onChange: handleAddressChange,
                                    })}
                                />
                                <p>{errors.address?.message}</p>
                            </div>
                            <div className="form-group col-6">
                                <label htmlFor="role">{t('user:role')}:</label>
                                <select
                                    id="role"
                                    className="form-select col-6"
                                    aria-label="role-select"
                                    value={userFormValue.role}
                                    disabled
                                >
                                    <option value="customer">{t('user:customer')}</option>
                                    <option value="staff">{t('user:staff')}</option>
                                    <option value="admin">{t('user:admin')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="manage-user__form__buttons d-flex mt-5 justify-content-center align-items-center gap-3">
                            <button disabled={isLoading || isLoading} className="btn btn-lg btn-primary " type="submit">
                                {t('common:confirm')}
                            </button>

                            <button
                                disabled={isLoading || isLoading}
                                className="btn btn-lg btn-secondary "
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(-1);
                                }}
                            >
                                {t('common:cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isUserLoading && <LoadingModal />}
        </>
    );
};

export default UserManagePanel;
