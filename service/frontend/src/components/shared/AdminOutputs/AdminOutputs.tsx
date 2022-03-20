import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    deleteOutputsItemAdminQuery,
    getOutputsBalanceAdminQuery,
    getOutputsItemAdminQuery,
    updateOutputsBalanceAdminQuery,
} from "../../../api/outputApi";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import styles from "./AdminOutputs.scss";

export default function AdminOutputs() {
    const [outputBalanceStates, setOutputBalanceStates] = useState([]);
    const [outputItemStates, setOutputItemStates] = useState([]);

    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    async function getTransactionsHistory() {
        const balanceResult = await getOutputsBalanceAdminQuery(tokenState);
        console.log(balanceResult.data);

        if (balanceResult.status === 200)
            setOutputBalanceStates(balanceResult.data);
        else console.log(balanceResult.data);

        const itemsResult = await getOutputsItemAdminQuery(tokenState);
        console.log(itemsResult.data);

        if (itemsResult.status === 200) setOutputItemStates(itemsResult.data);
        else console.log(itemsResult.data);
    }

    useEffect(() => {
        getTransactionsHistory();
    }, []);

    function getFormatDate(date: string) {
        // create date DD.MM.YYYY HH:MM
        return (
            date.split("T")[0].split("-").reverse().join(".") +
            " " +
            [
                date.split("T")[1].split(":")[0],
                date.split("T")[1].split(":")[1],
            ].join(":")
        );
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    {/* <th>Дата</th> */}
                    <th>Пользователь</th>
                    <th>Сумма</th>
                    <th>Операция</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(outputBalanceStates).map(
                    ([username, data], index_1) =>
                        (data as Array<any>).map((item, index_2) => (
                            <tr
                                key={
                                    "account-outptuts-balance" +
                                    index_1 +
                                    "_" +
                                    index_2
                                }
                            >
                                {/* <td>{getFormatDate(element.created_at)}</td> */}
                                {/* <td>DD.MM.YYYY HH:MM</td> */}
                                <td>{username}</td>
                                <td>
                                    Вывод баланса на сумму{" "}
                                    <span>{item.amount}</span>&nbsp;CSCoins
                                </td>
                                <td
                                    className={styles.action}
                                    onClick={() =>
                                        dispatch(
                                            openPopup("admin-output-balance", {
                                                username: username,
                                                info: item,
                                            })
                                        )
                                    }
                                >
                                    Подробнее
                                </td>
                            </tr>
                        ))
                )}

                {Object.entries(outputItemStates).map(
                    ([username, data], index_1) => (
                        <tr key={"account-outptuts-items" + index_1}>
                            {/* <td>{getFormatDate(element.created_at)}</td> */}
                            {/* <td>DD.MM.YYYY HH:MM</td> */}
                            <td>{username}</td>
                            <td>
                                Вывод <span>{data[0].title}</span>
                            </td>
                            <td
                                className={styles.action}
                                onClick={() =>
                                    dispatch(
                                        openPopup("admin-output-item", {
                                            username: username,
                                            item: data[0],
                                            ...data[1],
                                        })
                                    )
                                }
                            >
                                Подробнее
                            </td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
}
