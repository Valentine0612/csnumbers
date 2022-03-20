import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Cookies from "js-cookie";
import { refreshAuthTokenQuery, tokenRefresher } from "../../api/authTokenApi";
import {
    getTokenStorage,
    setTokenStorage,
} from "../../localStorage/tokenStorage";
import {
    setTokenState,
    setUserState,
} from "../../store/actionCreators/userActionCreator";
import Navbar from "../shared/Navbar/";
import View from "../views/View";
import styles from "./App.scss";
import Preloader from "../shared/Preloader";
import { deleteTokenStorage } from "../../localStorage/tokenStorage";
import ScrollToTop from "../shared/ScrollToTop/ScrollToTop";
import useWebSocket from "react-use-websocket";
import { IState } from "../../store";
import {
    GamesRequestType,
    COINFLIP_WEBSOCKET_URL,
    NUMBERS_WEBSOCKET_URL,
} from "../../websocket/coinflipWebsocket";
import { getUserInfoQuery } from "../../api/userApi";
import { openPopup } from "../../store/actionCreators/popupActionCreator";
import { getUserItemsQuery } from "../../api/itemsApi";
import { setInventoryState } from "../../store/actionCreators/inventoryActionCreator";

function App() {
    const [loadingState, setLoadingState] = useState(true);

    const tokenState = useSelector((state: IState) => state.user.token);
    const userIDState = useSelector((state: IState) => state.user.userInfo.id);

    const dispatch = useDispatch();

    const { lastMessage: coinflipLastMessage } = useWebSocket(
        COINFLIP_WEBSOCKET_URL
    );
    const { lastMessage: numbersLastMessage } = useWebSocket(
        NUMBERS_WEBSOCKET_URL
    );

    async function initUser() {
        const token = getTokenStorage() || Cookies.get("token");

        Cookies.remove("token");

        if (!token) {
            setLoadingState(false);
            return;
        }

        // Refresh user's token and get user's info
        const refreshTokenResult = await refreshAuthTokenQuery(token);
        // console.log(refreshTokenResult);

        if (refreshTokenResult.status !== 200) {
            console.log(refreshTokenResult);
            deleteTokenStorage();
            setLoadingState(false);
            return;
        }

        // Init user's redux state
        const expire = Date.now() + refreshTokenResult.data.expires_in * 1000;

        // Save token in storage and start token refresher
        tokenRefresher(refreshTokenResult.data.expires_in * 1000);
        setTokenStorage(refreshTokenResult.data.token);

        dispatch(setUserState(refreshTokenResult.data.user));
        dispatch(setTokenState(refreshTokenResult.data.token, expire));

        // Get user's inventory
        const getItemsResult = await getUserItemsQuery(token);
        // console.log(getItemsResult);

        if (getItemsResult.status !== 200) {
            console.log(getItemsResult);
            setLoadingState(false);
            return;
        }

        dispatch(setInventoryState(getItemsResult.data));

        setLoadingState(false);
    }

    async function updateUserInfo() {
        const result = await getUserInfoQuery(tokenState);
        if (result.status === 200) dispatch(setUserState(result.data));
    }

    useEffect(() => {
        initUser();
    }, []);

    useEffect(() => {
        if (coinflipLastMessage) {
            const newData = JSON.parse(coinflipLastMessage.data);
            updateUserInfoIfGameEnd(newData);
        }
    }, [coinflipLastMessage]);

    useEffect(() => {
        if (numbersLastMessage) {
            const newData = JSON.parse(numbersLastMessage.data);
            updateUserInfoIfGameEnd(newData, () => {
                dispatch(openPopup("numbers", newData.data));
            });
        }
    }, [numbersLastMessage]);

    function updateUserInfoIfGameEnd(newData: any, callback?: () => void) {
        // Update user info, if his game ended
        if (
            newData.action === GamesRequestType.joinGame &&
            (newData.data.player_1 === userIDState ||
                newData.data.player_2 === userIDState)
        ) {
            updateUserInfo();
            if (callback) callback();
        }
    }

    return loadingState ? (
        <div className={styles.preloader}>
            <Preloader />
        </div>
    ) : (
        <div className={styles.app}>
            <BrowserRouter>
                <ScrollToTop>
                    <Navbar className={styles.navbar} />
                    <View />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
}

export default App;
