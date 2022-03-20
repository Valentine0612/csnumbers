import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CoinFlipGamesItem from "../CoinFlipGamesItem";
import styles from "./CoinFlipGames.scss";
import animations from "./CoinFlipGamesAnimations.scss";
import useWebSocket from "react-use-websocket";
import {
    GamesRequestType,
    COINFLIP_WEBSOCKET_URL,
    NUMBERS_WEBSOCKET_URL,
} from "../../../websocket/coinflipWebsocket";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { v4 as uuid } from "uuid";
import { useLocation } from "react-router-dom";

function CoinFlipGames(props: CoinFlipGamesProps) {
    const [gamesList, setGameList] = useState([]);

    const dispatch = useDispatch();
    const locationState = useLocation();

    const { sendMessage, lastMessage } = useWebSocket(
        locationState.pathname.replace(/\//g, "") === ""
            ? NUMBERS_WEBSOCKET_URL
            : COINFLIP_WEBSOCKET_URL
    );

    const getGamesList = () => {
        sendMessage(
            JSON.stringify({
                action: GamesRequestType.list,
                request_id: 1,
            })
        );
    };

    useEffect(() => {
        getGamesList();
    }, []);

    useEffect(() => {
        if (lastMessage) {
            const data: any = JSON.parse(lastMessage.data).data;
            const action: string = JSON.parse(lastMessage.data).action;
            // console.log(JSON.parse(lastMessage.data));

            switch (action) {
                case GamesRequestType.list:
                    setGameList(
                        (data as Array<any>).map((game) => {
                            return createGame(game);
                        })
                    );

                    props.setAcitiveGamesCount(data.length);
                    props.setAllGamesCount(
                        Number(
                            locationState.pathname.replace(/\//g, "") === ""
                                ? JSON.parse(lastMessage.data).digits
                                : JSON.parse(lastMessage.data).coinflips
                        )
                    );
                    props.setAllGamesPrice(
                        Number(JSON.parse(lastMessage.data).bank)
                    );
                    break;

                case GamesRequestType.newGame:
                    let newGameList = gamesList;
                    newGameList.unshift(createGame(data));
                    setGameList([...newGameList]);
                    console.log(gamesList);

                    props.setAcitiveGamesCount(newGameList.length);
                    props.addAllGamesCount(1);
                    // props.addAllGamesPrice(Number(data.user_1.gunPrice));
                    break;

                case GamesRequestType.deleteGame:
                    let deleteGameList = gamesList.filter((game) => {
                        return (
                            Number(game.gameData.pk) !== Number(data.deleted)
                        );
                    });
                    setGameList([...deleteGameList]);

                    props.setAcitiveGamesCount(deleteGameList.length);
                    props.addAllGamesCount(-1);
                    // props.addAllGamesPrice(-1 * Number(data.user_1.gunPrice));
                    break;

                case GamesRequestType.joinGame:
                    let joinGameList = gamesList.map((game) => {
                        if (game.gameData.pk === data.pk)
                            return createGame(data, game.uuid);
                        else return game;
                    });

                    setGameList([...joinGameList]);

                    if (!(data.select_1 || data.select_2))
                        props.addAcitiveGamesCount(-1);
                    props.addAllGamesPrice(Number(data.user_1.gunPrice));

                    // Deleting item from list after delay
                    setTimeout(() => {
                        setGameList((currentGamesList) => [
                            ...currentGamesList.filter(
                                (game) => game.gameData.pk !== data.pk
                            ),
                        ]);
                    }, 30000);
                    break;

                default:
                    break;
            }
        }
    }, [lastMessage]);

    const createGame = (gameData: any, gameUuid?: string) => {
        return {
            uuid: gameUuid ? gameUuid : uuid(),

            player1: {
                profileImage:
                    gameData.user_1.avatar_url ||
                    location.origin + gameData.user_1.avatar,
                profileName: gameData.user_1.profileName,
                choose: gameData.bet_1,
            },

            player2: gameData.user_2
                ? {
                      profileImage:
                          gameData.user_2.avatar_url ||
                          location.origin + gameData.user_2.avatar,
                      profileName: gameData.user_2.profileName,
                      choose: gameData.bet_2,
                  }
                : null,

            gun1: {
                gunImage: location.origin + gameData.user_1.gunImage,
                gunName: gameData.user_1.gunName,
            },

            gun2: gameData.item_2
                ? {
                      gunImage: location.origin + gameData.user_2.gunImage,
                      gunName: gameData.user_2.gunName,
                  }
                : null,

            gamePrice: Math.round(gameData.user_1.gunPrice),
            lowerPrice: Math.round(gameData.user_1.gunPrice * 0.95),
            upperPrice: Math.round(gameData.user_1.gunPrice * 1.05),

            gameData: gameData,
        };
    };

    return (
        <div className={styles.games}>
            <div className={styles.gamesColumns}>
                <div className={styles.playerColumn}>Игроки</div>
                <div className={styles.gunColumn}>Снаряжение</div>
            </div>

            {/* <div className={styles.gamesList}> */}
            <TransitionGroup className={styles.gamesList}>
                {gamesList.map((game, index) => (
                    <CSSTransition
                        key={game.uuid}
                        classNames={{
                            appear: animations.gameItemAppear,
                            appearActive: animations.gameItemAppearActive,
                            enter: animations.gameItemAppear,
                            enterActive: animations.gameItemAppearActive,
                            exit: animations.gameItemExit,
                            exitActive: animations.gameItemExitActive,
                        }}
                        timeout={300}
                    >
                        <CoinFlipGamesItem
                            player1={game.player1}
                            player2={game.player2}
                            gun1={game.gun1}
                            gun2={game.gun2}
                            gamePrice={game.gamePrice}
                            lowerPrice={game.lowerPrice}
                            upperPrice={game.upperPrice}
                            withTeam={
                                locationState.pathname.replace(/\//g, "") ===
                                "coinflip"
                            }
                            buttonOnClickCallback={() =>
                                props.gameButtonOnClick(game.gameData)
                            }
                        />
                    </CSSTransition>
                ))}
            </TransitionGroup>
            {/* </div> */}
        </div>
    );
}

export default CoinFlipGames;

type CoinFlipGamesProps = {
    addAllGamesCount: (count: number) => void;
    addAllGamesPrice: (count: number) => void;
    addAcitiveGamesCount: (count: number) => void;
    setAllGamesCount: React.Dispatch<React.SetStateAction<number>>;
    setAllGamesPrice: React.Dispatch<React.SetStateAction<number>>;
    setAcitiveGamesCount: React.Dispatch<React.SetStateAction<number>>;
    gameButtonOnClick: (data: any) => void;
};
