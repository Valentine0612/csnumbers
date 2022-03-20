import { SET_USER_INFO, SET_TOKEN_INFO } from "../actions/userActions";

function userReducer(state: any = null, action: any) {
    switch (action.type) {
        case SET_USER_INFO:
            return { ...state, userInfo: action.userInfo };

        case SET_TOKEN_INFO:
            return {
                ...state,
                token: action.tokenInfo.token,
                expire: action.tokenInfo.expire,
            };

        default:
            return state;
    }
}

export default userReducer;
