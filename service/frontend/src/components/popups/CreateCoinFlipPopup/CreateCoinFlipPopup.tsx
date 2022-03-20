import React from "react";
import { useDispatch } from "react-redux";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import { COINFLIP_WEBSOCKET_URL } from "../../../websocket/coinflipWebsocket";
import CreateGamePopup from "../CreateGamePopup";

function CreateCoinFlipPopup() {
    const dispatch = useDispatch();

    return (
        <CreateGamePopup
            teamChooseAvailable
            title="Создать коинфлип"
            websocketURL={COINFLIP_WEBSOCKET_URL}
            openPopup={(data: any) => dispatch(openPopup("coinflip", data))}
        />
    );
}

export default CreateCoinFlipPopup;
