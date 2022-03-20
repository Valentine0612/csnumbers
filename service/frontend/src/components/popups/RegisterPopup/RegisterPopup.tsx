import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createUserQuery } from "../../../api/userApi";
import { setTokenStorage } from "../../../localStorage/tokenStorage";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import FormError from "../../shared/FormError";
import Preloader from "../../shared/Preloader";
import styles from "./RegisterPopup.scss";

function RegisterPopup() {
    const { register, handleSubmit, errors, setError } = useForm();
    const [isPreloaderShownState, setIsPreloaderShownState] = useState(false);

    const dispatch = useDispatch();

    const registerUser = async (data: any) => {
        setIsPreloaderShownState(true);
        const result = await createUserQuery(
            data.username,
            data.email,
            data.password
        );

        if (result.status === 201) {
            setTokenStorage(result.data.token);
            location.reload();
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
        }
        setIsPreloaderShownState(false);
    };

    return (
        <>
            <h3 className={styles.title}>
                Регистрация{" "}
                {isPreloaderShownState ? <Preloader inline /> : null}
            </h3>

            <form className={styles.form} onSubmit={handleSubmit(registerUser)}>
                <input
                    type="text"
                    name="username"
                    ref={register({
                        required: "Имя пользователя - обязательное поле",
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
                    })}
                    className={
                        errors.username ? styles.errorInput : styles.input
                    }
                    placeholder="Имя пользователя"
                />

                <input
                    type="text"
                    name="email"
                    ref={register({
                        required: "Email - обязательное поле",
                        pattern: {
                            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                            message:
                                "Некорректный Email (пример: test@test.com)",
                        },
                    })}
                    className={errors.email ? styles.errorInput : styles.input}
                    placeholder="Email"
                />

                <input
                    type="password"
                    name="password"
                    ref={register({
                        required: "Пароль - обязательное поле",
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
                    className={
                        errors.password ? styles.errorInput : styles.input
                    }
                    placeholder="Пароль"
                />

                {/* <input
                    type="text"
                    name="steamLink"
                    ref={register}
                    className={errors.steamLink ? styles.errorInput : styles.input}
                    placeholder="Ссылка на Steam"
                /> */}

                <FormError keyValue="register-form" errors={errors} />

                <div className={styles.buttonsBlock}>
                    <button
                        className={styles.steamButton}
                        onClick={() => dispatch(openPopup("login"))}
                    >
                        Уже есть аккаунт
                    </button>

                    <button type="submit" className={styles.button} autoFocus>
                        Зарегистрироваться
                    </button>
                </div>
            </form>
        </>
    );
}

export default RegisterPopup;
