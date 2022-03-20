export enum GamesRequestType {
    list = "list",
    newGame = "create",
    joinGame = "patch",
    deleteGame = "delete",
}

const websocketProtocol = location.protocol === "https:" ? "wss://" : "ws://";

export const COINFLIP_WEBSOCKET_URL =
    websocketProtocol + location.host + "/ws/coinflip/";

export const NUMBERS_WEBSOCKET_URL =
    websocketProtocol + location.host + "/ws/digit/";
