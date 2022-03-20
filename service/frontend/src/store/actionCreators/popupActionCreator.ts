import { CLOSE_POPUP, OPEN_POPUP } from "../actions/popupActions";

function openPopup(popupName: string, data: any = {}) {
    return {
        type: OPEN_POPUP,
        popupName: popupName,
        data: data,
    };
}

function closePopup() {
    return {
        type: CLOSE_POPUP,
    };
}

export { openPopup, closePopup };
