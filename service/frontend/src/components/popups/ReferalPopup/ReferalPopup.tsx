import React, { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReferalCodeQuery } from "../../../api/referalApi";
import { IState } from "../../../store";
import { closePopup } from "../../../store/actionCreators/popupActionCreator";
import styles from "./ReferalPopup.scss";

export default function ReferalPopup() {
    const [promocode, setPromocode] = useState("");

    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    return (
        <>
            <h3>Введите промокод</h3>
            <input
                type="text"
                className={styles.input}
                placeholder="Промокод"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setPromocode(event.target.value)
                }
            />
            <button
                className={styles.button}
                onClick={async () => {
                    const result = await createReferalCodeQuery(
                        tokenState,
                        promocode
                    );

                    if (result.status === 200) {
                        alert("Успешно!");
                        dispatch(closePopup());
                        return;
                    }

                    alert("Ошибка!");
                    console.log(result);
                    return;
                }}
            >
                Подтвердить
            </button>
        </>
    );
}
