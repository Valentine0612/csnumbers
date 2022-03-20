import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    deleteOutputBalanceQuery,
    deleteOutputItemQuery,
    getOutputsBalanceQuery,
    getOutputsItemQuery,
} from "../../../api/outputApi";
import { IState } from "../../../store";
import styles from "./AccountOutputs.scss";

export default function AccountOutputs() {
    const [outputBalanceStates, setOutputBalanceStates] = useState([]);
    const [outputItemStates, setOutputItemStates] = useState([]);

    const tokenState = useSelector((state: IState) => state.user.token);

    async function getTransactionsHistory() {
        const balanceResult = await getOutputsBalanceQuery(tokenState);
        console.log(balanceResult.data);

        if (balanceResult.status === 200)
            setOutputBalanceStates(balanceResult.data);
        else console.log(balanceResult.data);

        const itemsResult = await getOutputsItemQuery(tokenState);
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
                    <th>Сумма</th>
                    <th>Операция</th>
                </tr>
            </thead>
            <tbody>
                {outputBalanceStates.map((element, index) => {
                    return (
                        <tr key={"account-outputs-balance" + index}>
                            {/* <td>{getFormatDate(element.created_at)}</td> */}
                            <td>
                                Вывод баланса на сумму{" "}
                                <span>{element.amount}</span>&nbsp;CSCoins
                            </td>
                            <td
                                onClick={async () => {
                                    const result =
                                        await deleteOutputBalanceQuery(
                                            tokenState,
                                            element.id
                                        );

                                    if (result.status === 204)
                                        location.reload();
                                    else {
                                        alert("Failure");
                                        console.log(result);
                                    }
                                }}
                                className={styles.action}
                            >
                                Отменить
                            </td>
                        </tr>
                    );
                })}

                {outputItemStates.map((element, index) => {
                    return (
                        <tr key={"account-outptuts-items" + index}>
                            {/* <td>{getFormatDate(element.created_at)}</td> */}
                            {/* <td>DD.MM.YYYY HH:MM</td> */}
                            <td>
                                Вывод <span>{element.title}</span>
                            </td>
                            <td
                                onClick={async () => {
                                    const result = await deleteOutputItemQuery(
                                        tokenState,
                                        element.pk
                                    );

                                    if (result.status === 204)
                                        location.reload();
                                    else {
                                        alert("Failure");
                                        console.log(result);
                                    }
                                }}
                                className={styles.action}
                            >
                                Отменить
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
