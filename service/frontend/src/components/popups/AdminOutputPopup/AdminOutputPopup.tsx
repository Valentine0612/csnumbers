import React from "react";
import styles from "./AdminOutputPopup.scss";

export default function AdminOutputPopup(props: AdminOutputPopupProps) {
    return (
        <>
            <h3>{props.title}</h3>

            <div className={styles.infoBlock}>
                Имя пользователя: {props.username}
            </div>
            <div className={styles.infoBlock}>{props.outputSource}</div>
            <div className={styles.infoBlock}>Вывод: {props.outputProduct}</div>

            <div className={styles.buttonsBlock}>
                <button onClick={props.deleteButtonOnClick}>Отклонить</button>
                <button onClick={props.doneButtonOnClick}>Выполнить</button>
            </div>
        </>
    );
}

type AdminOutputPopupProps = {
    title: string;
    username: string;
    outputSource: string;
    outputProduct: string;
    deleteButtonOnClick: () => void;
    doneButtonOnClick: () => void;
};
