import { CLOSE_POPUP, OPEN_POPUP } from "../actions/popupActions";

function popupReducer(state: any = null, action: any) {
    switch (action.type) {
        case OPEN_POPUP:
            return {
                ...state,
                isOpened: true,
                type: action.popupName,
                data: action.data,
            };

        case CLOSE_POPUP:
            return {
                ...state,
                isOpened: false,
                type: null,
                data: null,
            };

        default:
            return state;
    }
}

export default popupReducer;
