import { Action, combineReducers } from "redux";
import { Product } from "../typings/product";
import inventoryReducer from "./reducers/inventoryReducer";
import popupReducer from "./reducers/popupReducer";
import userReducer from "./reducers/userReducer";

export interface IState {
    user: {
        token: string | null;
        expire: number | null;
        userInfo: IUserInfo;
    };

    popup: {
        isOpened: boolean;
        type: string | null;
        data: any;
    };

    inventory: Product[];
}

export interface IUserInfo {
    id: number | null;
    username: string | null;
    avatar_url: string | null;
    avatar: string | null;
    email: string | null;
    code: string | null;
    steam_uid: string | null;
    steam_link: string | null;
    is_staff: boolean | null;
    balance: number | null;
    coinflips: number | null;
    digits: number | null;
}

export const initialState: IState = {
    user: {
        token: null,
        expire: null,

        userInfo: {
            id: null,
            username: null,
            avatar_url: null,
            avatar: null,
            email: null,
            code: null,
            steam_uid: null,
            steam_link: null,
            is_staff: null,
            balance: null,
            coinflips: null,
            digits: null,
        },
    },

    popup: {
        isOpened: false,
        type: null,
        data: null,
    },

    // popup: {
    //     isOpened: true,
    //     type: "coinflip",
    //     data: {
    //         pk: 4,
    //         player_1: 1,
    //         player_2: 2,
    //         is_active: false,
    //         winner: 0,
    //         item_1: 5,
    //         item_2: 5,
    //         bet_1: 1,
    //         bet_2: 0,
    //         user_1: {
    //             profileName: "admin",
    //             avatar: "/images/user_admin/61320729-male-avatar-profile-picture-default-user-avatar-guest-avatar-simply-_M40LE7t.jpg",
    //             avatar_url: null,
    //             gunName: "USP-S Извилины",
    //             gunImage:
    //                 "/images/item_USP-S%20%D0%98%D0%B7%D0%B2%D0%B8%D0%BB%D0%B8%D0%BD%D1%8B/360fx360f_20.png",
    //             gunPrice: "316.00",
    //             gunTag: "USP-S",
    //         },
    //         user_2: {
    //             profileName: "Username",
    //             avatar: "/images/default_user/user.png",
    //             avatar_url:
    //                 "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/1c/1c194a711b39a7af73dc74c64b564916ab462dc3_medium.jpg",
    //             gunName: "USP-S Извилины",
    //             gunImage:
    //                 "/images/item_USP-S%20%D0%98%D0%B7%D0%B2%D0%B8%D0%BB%D0%B8%D0%BD%D1%8B/360fx360f_20.png",
    //             gunPrice: "316.00",
    //             gunTag: "USP-S",
    //         },
    //     },
    // },

    inventory: [],
};

export interface DispatchAction extends Action {
    payload: Partial<IState>;
}

export const rootReducer = combineReducers({
    user: userReducer,
    popup: popupReducer,
    inventory: inventoryReducer,
});
