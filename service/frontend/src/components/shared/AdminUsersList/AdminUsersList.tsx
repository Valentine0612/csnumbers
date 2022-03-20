import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllUsersQuery } from "../../../api/userApi";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";

import styles from "./AdminUsersList.scss";

export default function AdminUsersList() {
    const [usersState, setUsersState] = useState([]);
    const dispatch = useDispatch();

    const tokenState = useSelector((state: IState) => state.user.token);

    async function getAllUsers() {
        const result = await getAllUsersQuery(tokenState);

        if (result.status === 200) setUsersState(result.data);
        else console.log(result);
    }

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Баланс</th>
                    <th>Подробнее</th>
                </tr>
            </thead>
            <tbody>
                {usersState.map((element, index) => {
                    return (
                        <tr key={"account-history-" + index}>
                            <td>{element.id}</td>
                            <td>
                                <span>{element.username}</span>
                            </td>
                            <td>{element.balance} CSCoins</td>
                            <td>
                                <button
                                    className={styles.moreButton}
                                    onClick={() =>
                                        dispatch(openPopup("admin-user", { id: element.id }))
                                    }
                                >
                                    Подробнее
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
