import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createFeedbackQuery } from "../../../api/feedbackApi";
import { IState } from "../../../store";
import FormError from "../../shared/FormError";

import styles from "./HelpView.scss";

export default function HelpView() {
    const { register, handleSubmit, errors } = useForm();
    const userState = useSelector((state: IState) => state.user.userInfo);
    const tokenState = useSelector((state: IState) => state.user.token);

    async function loginCallback(data: any) {
        console.log(data);

        if (!tokenState) {
            alert("Ошибка: вы не авторизированны!");
            return;
        }

        const result = await createFeedbackQuery(tokenState, data.email, data.problem);

        if (result.status === 201) {
            location.reload();
            return;
        }

        console.log(result);
        alert("Неизвестная ошибка!");
    }

    return (
        <div className={styles.view}>
            <h3>Свяжитесь с нами</h3>

            <form onSubmit={handleSubmit(loginCallback)}>
                <div className={styles.inputsBox}>
                    <input
                        name="name"
                        type="text"
                        placeholder="Ваше имя"
                        className={errors.name ? styles.errorInput : styles.input}
                        defaultValue={userState.username}
                        ref={register({
                            required: "Имя - обязательное поле",
                        })}
                    />

                    <input
                        name="email"
                        type="text"
                        placeholder="E-mail"
                        className={errors.email ? styles.errorInput : styles.input}
                        defaultValue={userState.email}
                        ref={register({
                            required: "E-mail - обязательное поле",
                            pattern: {
                                value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: "Некорректный Email (пример: test@test.com)",
                            },
                        })}
                    />
                </div>

                <textarea
                    name="problem"
                    className={errors.problem ? styles.errorTextarea : styles.textarea}
                    placeholder="Сообщите о проблеме"
                    ref={register({
                        required: "Проблема - обязательное поле",
                    })}
                ></textarea>

                <FormError keyValue="problem-form" errors={errors} />

                <div className={styles.submitBlock}>
                    <div className={styles.checkbox}>
                        <input
                            type="checkbox"
                            name="checkbox"
                            id="accept-checkbox"
                            ref={register({
                                required: "Вы не приняли условия пользовательского соглашения",
                            })}
                        />
                        <label htmlFor="accept-checkbox">
                            Я принимаю условия <Link to="/">пользовательского соглашения</Link>
                        </label>
                    </div>

                    <button type="submit" className={styles.button}>
                        Отправить
                    </button>
                </div>
            </form>
        </div>
    );
}
