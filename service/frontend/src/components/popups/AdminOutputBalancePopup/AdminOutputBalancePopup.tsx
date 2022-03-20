import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    deleteOutputsBalanceAdminQuery,
    updateOutputsBalanceAdminQuery,
} from "../../../api/outputApi";
import { IState } from "../../../store";
import AdminOutputPopup from "../AdminOutputPopup";

export default function AdminOutputBalancePopup() {
    const [dataState, setDataState] = useState<any>({
        username: "",
        info: {},
    });

    const tokenState = useSelector((state: IState) => state.user.token);
    const popupData = useSelector((state: IState) => state.popup.data);

    useEffect(() => {
        if (popupData) setDataState(popupData);
    }, [popupData]);

    return (
        <AdminOutputPopup
            title="Вывод баланса на счет"
            username={dataState.username}
            outputSource={dataState.info.method + ": " + dataState.info.account}
            outputProduct={dataState.info.amount + " CS Coins"}
            deleteButtonOnClick={async () => {
                const result = await deleteOutputsBalanceAdminQuery(
                    tokenState,
                    dataState.info.id
                );
                if (result.status === 204) location.reload();
                else {
                    alert("Failure");
                    console.log(result);
                }
            }}
            doneButtonOnClick={async () => {
                const result = await updateOutputsBalanceAdminQuery(
                    tokenState,
                    dataState.info.id,
                    false
                );
                if (result.status === 200) location.reload();
                else {
                    alert("Failure");
                    console.log(result);
                }
            }}
        />
    );
}
