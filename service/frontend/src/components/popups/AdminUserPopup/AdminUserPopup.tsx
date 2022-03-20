import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeUserBalanceQuery } from "../../../api/transactionsApi";
import { getUserInfoAdminQuery, updateUserInfoAdminQuery } from "../../../api/userApi";
import { IState } from "../../../store";
import { closePopup } from "../../../store/actionCreators/popupActionCreator";
import { SELECTED_CURRENCY } from "../../../typings/currency";
import styles from "./AdminUserPopup.scss";

export default function AdminUserPopup() {
    const [userInfo, setUserInfo] = useState<any>({});
    const [isBanned, setIsBanned] = useState<boolean>(false);
    const [isWinner, setIsWinner] = useState<boolean>(false);
    const [userBalance, setUserBalance] = useState<number>();

    const popupData = useSelector((state: IState) => state.popup.data);
    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    async function getUsetInfo() {
        const result = await getUserInfoAdminQuery(tokenState, popupData.id);

        if (result.status === 200) {
            setUserInfo(result.data);
            setUserBalance(result.data.balance);
            setIsBanned(result.data.is_banned);
            setIsWinner(result.data.is_winner);
            return;
        }

        console.log(result);
        alert("Неизвестная ошибка!");
        dispatch(closePopup());
    }

    async function updateUserInfo() {
        const updateInfoResult = await updateUserInfoAdminQuery(
            tokenState,
            popupData.id,
            isBanned,
            isWinner
        );
        const updateUserBalance = await changeUserBalanceQuery(
            tokenState,
            popupData.id,
            userBalance
        );

        if (updateInfoResult.status === 200 && updateUserBalance.status === 200) {
            alert("Успешно!");
            dispatch(closePopup());
            return;
        }

        console.log(updateInfoResult);
        console.log(updateUserBalance);
        alert("Неизвестная ошибка!");
    }

    useEffect(() => {
        getUsetInfo();
        // console.log(popupData);
    }, []);

    return (
        <>
            <div className={styles.avatarWrapper}>
                <img src={userInfo.avatar_url || userInfo.avatar} alt={userInfo.username} />
            </div>

            <div className={styles.info}>
                <span>ID:</span> {userInfo.id}
            </div>
            <div className={styles.info}>
                <span>Имя пользователя:</span> {userInfo.username}
            </div>
            <div className={styles.info}>
                <span>Email:</span> {userInfo.email}
            </div>
            <div className={styles.info}>
                <span>Промокод:</span> {userInfo.code}
            </div>
            <div className={styles.info}>
                <span>Сыграно коинфлипов:</span> {userInfo.coinflips}
            </div>
            <div className={styles.info}>
                <span>Сыграно чисел:</span> {userInfo.numbers}
            </div>
            <div className={styles.info}>
                <span>Ссылка на steam:</span> {userInfo.steam_link}
            </div>

            <div className={styles.infoInput}>
                <label>Баланс:</label>
                <input
                    type="text"
                    value={userBalance || ""}
                    onChange={(event) => {
                        setUserBalance(
                            isNaN(Number(event.target.value))
                                ? userBalance || 0
                                : Number(event.target.value)
                        );
                    }}
                />
            </div>

            <div className={styles.checkboxBlock}>
                <input
                    type="checkbox"
                    name="is_banned"
                    id="is_banned"
                    checked={isBanned}
                    onChange={() => setIsBanned(!isBanned)}
                />
                <label htmlFor="is_banned">Забанен</label>
            </div>

            <div className={styles.checkboxBlock}>
                <input
                    type="checkbox"
                    name="is_winner"
                    id="is_winner"
                    checked={isWinner}
                    onChange={() => setIsWinner(!isWinner)}
                />
                <label htmlFor="is_winner">Выйгрышный аккаунт</label>
            </div>

            <button className={styles.button} onClick={updateUserInfo}>
                Сохранить
            </button>
        </>
    );
}
