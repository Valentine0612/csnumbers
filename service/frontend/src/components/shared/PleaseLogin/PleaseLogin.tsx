import React from "react";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import styles from "./PleaseLogin.scss";

function PleaseLogin() {
    const dispatch = useDispatch();

    return (
        <div className={styles.view}>
            <h3 className={styles.title}>Вы неавторизованный пользователь</h3>
            <p className={styles.description}>
                Чтобы продолжить, пожалуйста, авторизируйтесь
            </p>
            <button
                type="button"
                className={styles.button}
                onClick={() => dispatch(openPopup("login"))}
            >
                Войти
            </button>
        </div>
    );
}

export default PleaseLogin;
