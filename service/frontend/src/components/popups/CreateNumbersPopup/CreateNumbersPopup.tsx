import React from "react";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import { NUMBERS_WEBSOCKET_URL } from "../../../websocket/coinflipWebsocket";
import CreateGamePopup from "../CreateGamePopup";

export default function CreateNumbersPopup() {
    const dispatch = useDispatch();

    return (
        <CreateGamePopup
            title="Создать числа"
            websocketURL={NUMBERS_WEBSOCKET_URL}
            openPopup={(data: any) => dispatch(openPopup("numbers", data))}
        />
    );
}
