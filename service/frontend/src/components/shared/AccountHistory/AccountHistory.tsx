import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getTransactionsQuery } from "../../../api/transactionsApi";
import { IState } from "../../../store";
import styles from "./AccountHistory.scss";

const historyData = [
    {
        date: "23.01.21",
        cash: "-29",
        name: "Вывод в Steam",
    },
    {
        date: "23.01.21",
        cash: "-29",
        name: "Покупка AWP Electric Hipe",
    },
    {
        date: "23.01.21",
        cash: "+29",
        name: "Пополнение баланса",
    },
    {
        date: "23.01.21",
        cash: "+29",
        name: "Продажа AWP Electric Hipe",
    },
];

function AccountHistory() {
    const [transactionsState, setTransactionsState] = useState([]);

    const tokenState = useSelector((state: IState) => state.user.token);

    async function getTransactionsHistory() {
        const result = await getTransactionsQuery(tokenState);

        if (result.status === 200) setTransactionsState(result.data.reverse());
        else console.log(result.data);
    }

    useEffect(() => {
        getTransactionsHistory();
    }, []);

    function getFormatDate(date: string) {
        // create date DD.MM.YYYY HH:MM
        return (
            date.split("T")[0].split("-").reverse().join(".") +
            " " +
            [date.split("T")[1].split(":")[0], date.split("T")[1].split(":")[1]].join(":")
        );
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Операция</th>
                </tr>
            </thead>
            <tbody>
                {transactionsState.map((element, index) => {
                    return (
                        <tr key={"account-history-" + index}>
                            <td>{getFormatDate(element.created_at)}</td>
                            <td>
                                <span>{element.amount}</span> CSCoins
                            </td>
                            <td>{element.info}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default AccountHistory;
