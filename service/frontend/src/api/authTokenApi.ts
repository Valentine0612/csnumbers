import axios from "axios";
import { setTokenStorage } from "../localStorage/tokenStorage";
import { store } from "../store";
import { setTokenState } from "../store/actionCreators/userActionCreator";

export async function createAuthTokenQuery(username: string, password: string) {
    try {
        let result = await axios.post("/api/token/", {
            username: username,
            password: password,
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export async function refreshAuthTokenQuery(token: string) {
    try {
        let result = await axios.post("/api/token/refresh/", {
            token: token,
        });
        return result;
    } catch (err) {
        return err.response;
    }
}

export function tokenRefresher(timeoutMilliseconds: number) {
    setInterval(async () => {
        const result = await refreshAuthTokenQuery(store.getState().user.token);

        if (result.status === 200) {
            const expire = Date.now() + result.data.expires_in * 1000;
            setTokenStorage(result.data.token);
            store.dispatch(setTokenState(result.data.token, expire));
        }
    }, timeoutMilliseconds - 2000);
}
