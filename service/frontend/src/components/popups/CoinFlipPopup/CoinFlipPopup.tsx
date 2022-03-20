import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store";
import ProductImage from "../../shared/ProductImage";
import UserImage from "../../shared/UserImage";

import styles from "./CoinFlipPopup.scss";

import terroristCoin from "../../../images/png/terroristIconBig.png";
import counterTerroristCoin from "../../../images/png/counterTerroristIconBig.png";
import bothTeamCoin from "../../../images/png/bothTeamIconBig.png";
import terroristWin from "../../../images/gif/terroristWin.gif";
import counterTerroristWin from "../../../images/gif/counterTerroristWin.gif";
import { Team } from "../../../typings/teams";
import { closePopup, openPopup } from "../../../store/actionCreators/popupActionCreator";
import ProductSelector from "../../shared/ProductSelector";
import { Product } from "../../../typings/product";
import useWebSocket from "react-use-websocket";
import { GamesRequestType, COINFLIP_WEBSOCKET_URL } from "../../../websocket/coinflipWebsocket";
import { useHistory } from "react-router";
import Preloader from "../../shared/Preloader";
import {
    deleteInventoryItem,
    setInventoryState,
} from "../../../store/actionCreators/inventoryActionCreator";
import { getUserItemsQuery } from "../../../api/itemsApi";

export default function CoinFlipPopup() {
    const popupData = useSelector((state: IState) => state.popup.data);
    const userState = useSelector((state: IState) => state.user);

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.waitingOpponent);
    const [gameStatusImage, setGameStatusImage] = useState<string>();
    const [productsLoaderShown, setProductsLoaderShown] = useState(false);
    const [productsSelectorCount, setProductsSelectorCount] = useState<number>();

    const [priceFilter, setPriceFilter] = useState({
        price: 0,
        delta: 0.05,
    });
    const [gameData, setGameData] = useState<any>({
        user_1: {},
        user_2: {},
    });

    const [timerCounter, setTimerCounter] = useState<number>();
    const [timerID, setTimerID] = useState<NodeJS.Timeout>();

    const dispatch = useDispatch();
    const history = useHistory();

    const { sendMessage, lastMessage } = useWebSocket(
        COINFLIP_WEBSOCKET_URL + (userState.token ? "?token=" + userState.token : "")
    );

    useEffect(() => {
        if (popupData) {
            setGameData({
                ...popupData,
                user_1: popupData.user_1 || {},
                user_2: popupData.user_2 || {},
            });
            setPriceFilter({
                ...priceFilter,
                price: popupData.user_1.gunPrice,
            });

            if (popupData.winner !== null) {
                setGameStatus(GameStatus.chooseWinner);
                createWinner(popupData.winner);
            } else {
                setGameStatusImage(bothTeamCoin);
            }
        }
    }, [popupData]);

    useEffect(() => {
        if (lastMessage) {
            const newData = JSON.parse(lastMessage.data);

            if (newData.data.pk === gameData.pk) {
                switch (newData.action) {
                    case GamesRequestType.joinGame:
                        dispatch(openPopup("coinflip", newData.data));
                        break;

                    case GamesRequestType.deleteGame:
                        dispatch(closePopup());
                        break;

                    default:
                        break;
                }
            }
        }
    }, [lastMessage]);

    function createWinner(winnerTeam: Team) {
        setTimerCounter(5);

        const newtimerID = setInterval(() => {
            let isTimerEnded = false;

            setTimerCounter((timerCounter) => {
                isTimerEnded = timerCounter < 1;
                return timerCounter - 1;
            });
        }, 1000);

        setTimerID(newtimerID);

        // Reload gif
        setGameStatusImage(
            (winnerTeam === Team.terrorist ? terroristWin : counterTerroristWin) +
                "?a=" +
                Math.random()
        );
    }

    useEffect(() => {
        if (timerCounter < 1 && timerID) {
            clearInterval(timerID);
        }
    }, [timerCounter]);

    useEffect(() => {
        return () => {
            if (timerID) clearInterval(timerID);
        };
    }, []);

    const LoginBlock = () => (
        // Please log in block
        <div className={styles.loginBlock}>
            <div className={styles.loginBlockTitle}>Войдите, чтобы поучаствовать</div>
            <button
                className={styles.loginBlockButton}
                onClick={() => dispatch(openPopup("login", gameData))}
            >
                Войти
            </button>
        </div>
    );

    const JoinBlock = () => (
        <div className={styles.chooseProductBlock}>
            <div className={styles.chooseProductTitle}>
                {productsSelectorCount > 0
                    ? "Ваши предметы (" + productsSelectorCount + ") "
                    : "У вас нет подходящих предметов "}
                {productsLoaderShown ? <Preloader inline /> : null}
            </div>

            <div className={styles.productsListBlock}>
                <div
                    className={styles.productList}
                    style={{
                        marginBottom: productsSelectorCount > 0 ? "12px" : 0,
                    }}
                >
                    <ProductSelector
                        background="dark"
                        priceFilter={priceFilter}
                        cardOnClick={(product) => {
                            setSelectedProduct(product);
                        }}
                        setProductsCount={setProductsSelectorCount}
                        setProductsLoaderShown={setProductsLoaderShown}
                    />
                </div>

                {productsSelectorCount > 0 ? (
                    <button
                        className={styles.joinGameButton}
                        onClick={() => {
                            if (selectedProduct) {
                                dispatch(deleteInventoryItem(selectedProduct.pk));

                                sendMessage(
                                    JSON.stringify({
                                        action: GamesRequestType.joinGame,
                                        request_id: 1,
                                        pk: gameData.pk,
                                        data: {
                                            item_2: selectedProduct.pk,
                                            bet_2: gameData.bet_1 ? 0 : 1,
                                        },
                                    })
                                );
                            }
                        }}
                    >
                        Играть
                    </button>
                ) : (
                    <button
                        className={styles.joinGameButton}
                        onClick={() => {
                            history.push("/shop");
                            dispatch(closePopup());
                        }}
                    >
                        В магазин
                    </button>
                )}
            </div>
        </div>
    );

    const GunBlock = () => (
        <div className={styles.productBlock}>
            <div className={styles.productItem}>
                <div className={styles.productImageAndName}>
                    <div className={styles.productImage}>
                        <ProductImage
                            productImage={gameData.user_1.gunImage}
                            productQuality=""
                            background="dark"
                        />
                    </div>

                    <div className={styles.productName}>
                        <span>{gameData.user_1.gunTag}</span>
                        {gameData.user_1.gunName}
                    </div>
                </div>

                <div className={styles.productPrice}>
                    {Math.round(gameData.user_1.gunPrice)}
                    <span> CSCoins</span>
                </div>
            </div>
        </div>
    );

    const WaitingBlock = () => (
        <div className={styles.waitOpponentBlock}>
            <div className={styles.waitOpponentTitle}>Ожидаем соперника</div>
            <button
                className={styles.waitOpponentButton}
                onClick={async () => {
                    sendMessage(
                        JSON.stringify({
                            action: GamesRequestType.deleteGame,
                            request_id: 1,
                            pk: gameData.pk,
                        })
                    );

                    // Get user's inventory
                    const getItemsResult = await getUserItemsQuery(userState.token);

                    if (getItemsResult.status !== 200) {
                        console.log(getItemsResult);
                        return;
                    }

                    dispatch(setInventoryState(getItemsResult.data));
                    dispatch(closePopup());
                }}
            >
                Отменить игру
            </button>
        </div>
    );

    return (
        <>
            <div className={styles.gameId}>КоинФлип #{gameData.pk}</div>
            <div className={styles.gameStatus}>
                {gameData.winner !== null && timerCounter > 0 ? (
                    <div className={styles.gameStatusCounterWrapper}>
                        <div className={styles.gameStatusCounter}>{timerCounter}</div>
                    </div>
                ) : (
                    <img
                        src={gameStatusImage}
                        alt="winner"
                        className={styles.gameStatusImage}
                        onLoad={() => {
                            if (gameStatus === GameStatus.chooseWinner) {
                                setTimeout(
                                    () => {
                                        setGameStatus(
                                            gameData.winner === Team.terrorist
                                                ? GameStatus.terroristWin
                                                : GameStatus.counterTerroristWin
                                        );
                                    },
                                    gameData.winner === Team.terrorist ? 2500 : 2900
                                );
                            }
                        }}
                    />
                )}

                <div className={styles.gameStatusName}>{gameStatus}</div>
            </div>

            <div className={styles.gameBlock}>
                <div className={styles.gameUserBlock}>
                    <div
                        className={
                            gameData.bet_1
                                ? styles.gameSideTerrorist
                                : styles.gameSideCounterTerrorist
                        }
                    >
                        <div className={styles.userImage}>
                            <UserImage
                                choosenTeam={gameData.bet_1}
                                userImage={gameData.user_1.avatar_url || gameData.user_1.avatar}
                                userName={gameData.user_1.profileName}
                                circle
                                withTeam
                            />
                        </div>

                        <div className={styles.userName}>{gameData.user_1.profileName}</div>
                    </div>

                    <div className={styles.productBlock}>
                        <div className={styles.productItem}>
                            <div className={styles.productImageAndName}>
                                <div className={styles.productImage}>
                                    <ProductImage
                                        productImage={gameData.user_1.gunImage}
                                        productQuality=""
                                        background="dark"
                                    />
                                </div>

                                <div className={styles.productName}>
                                    <span>{gameData.user_1.gunTag}</span>
                                    {gameData.user_1.gunName}
                                </div>
                            </div>

                            <div className={styles.productPrice}>
                                {Math.round(gameData.user_1.gunPrice)}
                                <span> CSCoins</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.gameUserBlock}>
                    <div
                        className={
                            gameData.bet_2 || !gameData.bet_1
                                ? styles.gameSideTerrorist
                                : styles.gameSideCounterTerrorist
                        }
                    >
                        <div className={styles.userImage}>
                            <UserImage
                                choosenTeam={
                                    gameData.bet_1 === Team.counterTerrorist
                                        ? Team.terrorist
                                        : Team.counterTerrorist
                                }
                                userImage={
                                    gameData.user_2.avatar_url ||
                                    gameData.user_2.avatar ||
                                    (gameData.bet_1 === Team.counterTerrorist
                                        ? terroristCoin
                                        : counterTerroristCoin)
                                }
                                userName={gameData.user_2.profileName || "Ожидаем соперника"}
                                circle
                                withTeam
                            />
                        </div>

                        <div className={styles.userName}>
                            {gameData.user_2.profileName || "Ожидаем соперника"}
                        </div>
                    </div>

                    {gameData.player_1
                        ? gameData.player_2
                            ? GunBlock()
                            : userState.token
                            ? gameData.player_1 === userState.userInfo.id
                                ? WaitingBlock()
                                : JoinBlock()
                            : LoginBlock()
                        : null}
                </div>
            </div>
        </>
    );
}

enum GameStatus {
    terroristWin = "Победа террористов",
    counterTerroristWin = "Победа контртеррористов",
    chooseWinner = "Определяем победителя",
    waitingOpponent = "Ожидаем соперника",
}
