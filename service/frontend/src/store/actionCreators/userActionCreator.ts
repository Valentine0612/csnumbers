import { SET_USER_INFO, SET_TOKEN_INFO } from "../actions/userActions";
import { IUserInfo } from "../rootReducer";

function setUserState(userInfo: IUserInfo) {
    return {
        type: SET_USER_INFO,
        userInfo: userInfo,
    };
}

function setTokenState(token: string = null, expire: number = null) {
    return {
        type: SET_TOKEN_INFO,
        tokenInfo: { token: token, expire: expire },
    };
}

export { setTokenState, setUserState };
