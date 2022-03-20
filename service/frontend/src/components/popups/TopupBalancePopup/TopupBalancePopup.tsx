import React, { useState } from "react";
import { useSelector } from "react-redux";
import { goToFreekassaPayment } from "../../../api/freekassaApi";
import { IState } from "../../../store";
import { SELECTED_CURRENCY } from "../../../typings/currency";
import styles from "./TopupBalancePopup.scss";

export default function TopupBalancePopup() {
    const [amount, setAmount] = useState<number>(0);

    const tokenState = useSelector((state: IState) => state.user.token);

    return (
        <>
            <h3>Пополнение баланса</h3>

            <input
                type="text"
                placeholder="Сумма пополнения"
                className={styles.input}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = Number(event.target.value);

                    if (!isNaN(newValue)) setAmount(Number(event.target.value));
                    else event.target.value = String(amount);
                }}
            />

            <button
                className={styles.button}
                onClick={async () => {
                    if (amount < 10) {
                        alert("Ошибка: минимальное пополнение 10 " + SELECTED_CURRENCY);
                        return;
                    }

                    const result = await goToFreekassaPayment(amount, tokenState);

                    if (result.status === 200) {
                        location.href = result.data;
                    }

                    if (result.status === 403) {
                        alert("Ошибка: для пополнения активируйте аккаунт по email!");
                        return;
                    }

                    console.log(result);
                }}
            >
                Пополнить
            </button>
        </>
    );
}
