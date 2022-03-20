import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { createAuthTokenQuery } from "../../../api/authTokenApi";
import { setTokenStorage } from "../../../localStorage/tokenStorage";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import FormError from "../../shared/FormError";
import Preloader from "../../shared/Preloader";
import styles from "./LoginPopup.scss";

function LoginPopup() {
    const { register, handleSubmit, errors, setError } = useForm();
    const [isPreloaderShownState, setIsPreloaderShownState] = useState(false);

    const dispatch = useDispatch();

    async function loginCallback(data: any) {
        setIsPreloaderShownState(true);

        const result = await createAuthTokenQuery(data.username, data.password);

        if (result.status === 200) {
            setTokenStorage(result.data.token);
            location.reload();
        } else if (result.data.non_field_errors)
            setError("username", {
                type: "Not found user",
                message: "Пользователей с этим именем и паролем не найдено",
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
    }

    return (
        <>
            <h3 className={styles.title}>
                Вход {isPreloaderShownState ? <Preloader inline /> : null}
            </h3>

            <form onSubmit={handleSubmit(loginCallback)}>
                <input
                    type="text"
                    name="username"
                    className={
                        errors.username ? styles.errorInput : styles.input
                    }
                    placeholder="Ваше имя пользователя"
                    ref={register({
                        required: "Имя пользователя - обязательное поле",
                    })}
                />

                <input
                    type="password"
                    name="password"
                    className={
                        errors.password ? styles.errorInput : styles.input
                    }
                    placeholder="Пароль"
                    ref={register({
                        required: "Пароль - обязательное поле",
                    })}
                />

                <FormError keyValue="login-form" errors={errors} />

                <div className={styles.buttonsBlock}>
                    <button
                        type="button"
                        className={styles.steamButton}
                        onClick={() => {
                            location.href = "/api/steam/login";
                        }}
                    >
                        Войти через Steam
                    </button>
                    <button type="submit" autoFocus>
                        Войти
                    </button>
                </div>

                <button
                    type="button"
                    className={styles.toRegister}
                    onClick={() => dispatch(openPopup("register"))}
                >
                    Зарегистрироваться
                </button>
            </form>
        </>
    );
}

export default LoginPopup;
