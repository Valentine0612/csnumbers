import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { updateUserInfoQuery } from "../../../api/userApi";
import { setTokenStorage } from "../../../localStorage/tokenStorage";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import FormError from "../FormError";
import Preloader from "../Preloader";

import styles from "./AccountProfile.scss";

export default function AccountProfile() {
    const { register, handleSubmit, errors, setError, clearErrors } = useForm();

    const tokenState = useSelector((state: IState) => state.user.token);
    const usernameState = useSelector(
        (state: IState) => state.user.userInfo.username
    );
    const emailState = useSelector(
        (state: IState) => state.user.userInfo.email
    );
    const steamLinkState = useSelector(
        (state: IState) => state.user.userInfo.steam_link
    );
    const promocodeState = useSelector(
        (state: IState) => state.user.userInfo.code
    );
    const userIDState = useSelector((state: IState) => state.user.userInfo.id);
    const steamIDState = useSelector(
        (state: IState) => state.user.userInfo.steam_uid
    );
    const avatarState = useSelector(
        (state: IState) =>
            state.user.userInfo.avatar_url || state.user.userInfo.avatar
    );

    const [srcAvatarState, setSrcAvatarState] = useState("");
    const [isPreloaderShownState, setIsPreloaderShownState] = useState(false);

    const locationState = useLocation();
    const dispatch = useDispatch();

    const getRandom = () => Math.floor(Math.random() * 10000 + 1);

    const uploadImageOnChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): null | void => {
        clearErrors("avatar");
        setSrcAvatarState("");
        console.log(event.target.files);
        if (event.target.files.length > 0) {
            let file = event.target.files[0];

            if (file.size > 2097152) {
                setError("avatar", {
                    type: "To large",
                    message: "Аватар слишком большого размера (макс. 2МВ)",
                });
                return null;
            }

            if (file.type.split("/")[0] !== "image") {
                setError("avatar", {
                    type: "Incorrect format",
                    message:
                        "Неккоректный формат для аватара (требуется изображение)",
                });
                return null;
            }

            let reader = new FileReader();
            reader.onload = (event) => {
                setSrcAvatarState(event.target.result.toString());
            };
            reader.readAsDataURL(file);
        }
    };

    const correctAccount = async (data: any) => {
        setIsPreloaderShownState(true);

        data.avatar = data.avatar[0];

        if (data.password !== data.confirmPassword)
            setError("confirmPassword", {
                type: "Passwords differ",
                message: "Пароли не совпадают",
            });
        else {
            console.log(data);

            const updateData: FormData = new FormData();

            Object.keys(data).forEach((prop) => {
                if (data[prop]) updateData.append(prop, data[prop]);
            });

            if (!updateData.has("username"))
                updateData.append("username", usernameState);

            const result = await updateUserInfoQuery(
                tokenState,
                userIDState,
                updateData,
                updateData.has("avatar") ? true : false
            );

            console.log(result);

            if (result.status === 200) {
                setTokenStorage(result.data.token);
                location.replace(locationState.pathname);
            } else if (result.data.username)
                setError("username", {
                    type: "Already using",
                    message: "Имя пользователя уже используется",
                });
            else if (result.data.email)
                setError("email", {
                    type: "Already using",
                    message: "Email уже используется",
                });
            else {
                setError("form", {
                    type: "Unknown",
                    message:
                        "Ошибка " +
                        result.status +
                        ". Попробуйте перезагрузить страницу",
                });
                console.log(result);
                console.log(updateData);
            }

            setIsPreloaderShownState(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(correctAccount)}>
            <div className={styles.accountProfile}>
                <div className={styles.avatarWrapper}>
                    <img
                        src={srcAvatarState || avatarState}
                        alt={usernameState}
                        className={styles.avatarImage}
                    />
                    <input
                        type="file"
                        name="avatar"
                        className={styles.avatarFileInput}
                        id="avatar-file"
                        ref={register}
                        onChange={uploadImageOnChange}
                        multiple={false}
                    />
                    {!steamIDState ? (
                        <label
                            htmlFor="avatar-file"
                            className={styles.avatarLabel}
                        >
                            <FontAwesomeIcon icon={faCog} />
                        </label>
                    ) : null}
                </div>

                <div className={styles.infoBlock}>
                    <div>
                        <label htmlFor="username" className={styles.inputLabel}>
                            Имя пользователя:
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            className={styles.inputText}
                            defaultValue={usernameState}
                            ref={
                                !steamIDState
                                    ? register({
                                          minLength: {
                                              value: 4,
                                              message:
                                                  "Имя пользователя должно содержать минимум 4 символа",
                                          },
                                          pattern: {
                                              value: /^[a-zA-Z0-9]+$/,
                                              message:
                                                  "Имя пользователя содержит недопустимые символы (только a-z, A-Z, 0-9)",
                                          },
                                      })
                                    : null
                            }
                            autoComplete="new-password"
                            disabled={steamIDState ? true : false}
                            placeholder="Username"
                        />
                    </div>
                    <div className={styles.promoInfo}>
                        <button
                            type="button"
                            className={styles.promoButton}
                            onClick={() => dispatch(openPopup("referal"))}
                        >
                            Ввести промокод
                        </button>
                        <div className={styles.promoInfoText}>
                            Мой промокод:
                            <span>{promocodeState}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="email" className={styles.inputLabel}>
                    Е-mail:
                </label>
                <input
                    type="text"
                    className={styles.inputText}
                    defaultValue={emailState}
                    name="email"
                    id="email"
                    ref={register({
                        pattern: {
                            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                            message:
                                "Некорректный Email (пример: test@test.com)",
                        },
                    })}
                    autoComplete="new-password"
                    placeholder="email@email.com"
                />

                <label htmlFor="steam_link" className={styles.inputLabel}>
                    Ссылка на обмен Steam:
                </label>
                <input
                    type="text"
                    className={styles.inputText}
                    defaultValue={steamLinkState}
                    name="steam_link"
                    id="steam_link"
                    ref={register}
                    autoComplete="new-password"
                    placeholder="https://steamcommunity.com/tradeoffer/new/?partner=id&token=token"
                />

                {!steamIDState ? (
                    <div className={styles.passwordReset}>
                        <h3>Смена пароля</h3>

                        <label htmlFor="password" className={styles.inputLabel}>
                            Новый пароль (не заполняйте, чтобы оставить прежний)
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className={styles.inputText}
                            ref={register({
                                minLength: {
                                    value: 8,
                                    message:
                                        "Пароль должен содержать минимум 8 символов",
                                },
                                pattern: {
                                    value: /^[a-zA-Z0-9]+$/,
                                    message:
                                        "Пароль содержит недопустимые символы (только a-z, A-Z, 0-9)",
                                },
                            })}
                            autoComplete="new-password"
                        />

                        <label
                            htmlFor="confirmPassword"
                            className={styles.inputLabel}
                        >
                            Подтвердите новый пароль
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            id={
                                "confirmPassword" +
                                Math.floor(Math.random() * 10000 + 1)
                            }
                            className={styles.inputText}
                            ref={register}
                            autoComplete="new-password"
                        />
                    </div>
                ) : null}
            </div>

            <FormError keyValue="account-profile-form" errors={errors} />

            <button type="submit" className={styles.saveButton}>
                Сохранить изменения
                {isPreloaderShownState ? (
                    <div className={styles.preloader}>
                        <Preloader inline />
                    </div>
                ) : null}
            </button>
        </form>
    );
}
