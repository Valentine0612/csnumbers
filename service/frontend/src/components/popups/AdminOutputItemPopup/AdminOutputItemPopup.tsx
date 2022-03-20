import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteOutputsItemAdminQuery } from "../../../api/outputApi";
import { IState } from "../../../store";
import AdminOutputPopup from "../AdminOutputPopup";

export default function AdminOutputItemPopup() {
    const [dataState, setDataState] = useState<any>({
        username: "",
        item: {},
    });

    const tokenState = useSelector((state: IState) => state.user.token);
    const popupData = useSelector((state: IState) => state.popup.data);

    useEffect(() => {
        if (popupData) setDataState(popupData);
    }, [popupData]);

    return (
        <AdminOutputPopup
            title="Вывод предмета Steam"
            username={dataState.username}
            outputSource={"Steam: " + dataState.steam_link}
            outputProduct={dataState.item.title}
            deleteButtonOnClick={async () => {
                const result = await deleteOutputsItemAdminQuery(
                    tokenState,
                    dataState.username,
                    dataState.item.pk,
                    false
                );
                if (result.status === 200) location.reload();
                else {
                    alert("Failure");
                    console.log(result);
                }
            }}
            doneButtonOnClick={async () => {
                const result = await deleteOutputsItemAdminQuery(
                    tokenState,
                    dataState.username,
                    dataState.item.pk,
                    true
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
