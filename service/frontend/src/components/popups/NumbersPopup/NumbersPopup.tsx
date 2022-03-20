import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store";
import { SELECTED_CURRENCY } from "../../../typings/currency";
import { Team } from "../../../typings/teams";
import GameField from "../../shared/GameField";
import ProductImage from "../../shared/ProductImage";
import UserImage from "../../shared/UserImage";
import styles from "./NumbersPopup.scss";
import unknownUserImage from "../../../images/png/defaultUser.png";
import ProductSelector from "../../shared/ProductSelector";
import Preloader from "../../shared/Preloader";
import {
    closePopup,
    openPopup,
} from "../../../store/actionCreators/popupActionCreator";
import { useHistory } from "react-router";
import {
    GamesRequestType,
    NUMBERS_WEBSOCKET_URL,
} from "../../../websocket/coinflipWebsocket";
import useWebSocket from "react-use-websocket";
import { Product } from "../../../typings/product";
import { deleteInventoryItem } from "../../../store/actionCreators/inventoryActionCreator";

export default function NumbersPopup() {
    const popupData = useSelector((state: IState) => state.popup.data);
    const userState = useSelector((state: IState) => state.user);

    const [productSelectorShown, setProductSelectorShown] = useState(false);
    const [productSelectorCount, setProductSelectorCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [priceFilter, setPriceFilter] = useState({
        price: 0,
        delta: 0.05,
    });
    const [gameData, setGameData] = useState<any>({
        user_1: {},
        user_2: {},
    });

    const dispatch = useDispatch();
    const history = useHistory();

    const { sendMessage, lastMessage } = useWebSocket(
        NUMBERS_WEBSOCKET_URL +
            (userState.token ? "?token=" + userState.token : "")
    );

    useEffect(() => {
        console.log(popupData);

        if (popupData) {
            setGameData(popupData);
            setPriceFilter({
                ...priceFilter,
                price: popupData.user_1.gunPrice,
            });
        }
    }, [popupData]);

    useEffect(() => {
        if (lastMessage) {
            const newData = JSON.parse(lastMessage.data);

            if (newData.data.pk === gameData.pk) {
                switch (newData.action) {
                    case GamesRequestType.joinGame:
                        dispatch(openPopup("numbers", newData.data));
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

    function PlayerBlock(props: { userData: any }) {
        return (
            <div className={styles.player}>
                <div className={styles.avatarWrapper}>
                    <UserImage
                        userImage={
                            props.userData
                                ? props.userData.avatar_url ||
                                  props.userData.avatar
                                : unknownUserImage
                        }
                        userName={
                            props.userData ? props.userData.profileName : ""
                        }
                    />
                </div>

                <div className={styles.playerName}>
                    {props.userData
                        ? props.userData.profileName
                        : "Ожидание оппонета"}
                </div>
            </div>
        );
    }

    function ProductBlock(props: { userData: any }) {
        return (
            <div className={styles.product}>
                <div className={styles.productWrapper}>
                    <ProductImage
                        productImage={props.userData.gunImage}
                        productQuality={""}
                        background="dark"
                    />
                </div>

                <div className={styles.productInfo}>
                    <div className={styles.productInfoTop}>
                        <div className={styles.productInfoName}>
                            {props.userData.gunName}
                        </div>
                        <div className={styles.productInfoPrice}>
                            {Number(props.userData.gunPrice).toFixed(0) +
                                " " +
                                SELECTED_CURRENCY}
                        </div>
                    </div>
                    <div className={styles.productInfoTag}>
                        {props.userData.gunTag}
                    </div>
                </div>
            </div>
        );
    }

    const SelectorBlock = () => (
        <div className={styles.productSelectorBlock}>
            <h4 className={styles.productSelectorTitle}>
                {productSelectorCount > 0
                    ? "Ваши предметы (" + productSelectorCount + ") "
                    : "У вас нет подходящих предметов "}
                {productSelectorShown ? <Preloader inline /> : null}
            </h4>

            <div className={styles.productSelector}>
                <ProductSelector
                    setProductsLoaderShown={setProductSelectorShown}
                    setProductsCount={setProductSelectorCount}
                    priceFilter={priceFilter}
                    cardOnClick={(product) => {
                        setSelectedProduct(product);
                    }}
                    background="dark"
                />
            </div>

            {productSelectorCount > 0 ? (
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
    );

    const LoginBlock = () => (
        // Please log in block
        <div className={styles.loginBlock}>
            <div className={styles.loginBlockTitle}>
                Войдите, чтобы поучаствовать
            </div>
            <button
                className={styles.loginBlockButton}
                onClick={() => dispatch(openPopup("login", gameData))}
            >
                Войти
            </button>
        </div>
    );

    return (
        <>
            <h3 className={styles.title}>Игра #{gameData.pk}</h3>

            <div className={styles.playersBlockWrapper}>
                <div className={styles.playersBlock}>
                    <PlayerBlock userData={gameData.user_1} />
                    <PlayerBlock userData={gameData.user_2} />
                </div>
            </div>

            <div className={styles.fieldsBlock}>
                <div>
                    <div className={styles.mobileUser}>
                        <PlayerBlock userData={gameData.user_1} />
                    </div>

                    <ProductBlock userData={gameData.user_1} />
                    <GameField
                        keyValue="numbers-popup__player1__gameField__"
                        team={Team.terrorist}
                        playerResult={gameData.bet_1}
                        playerChoose={gameData.select_1}
                        fieldActive={
                            gameData.player_1 === userState.userInfo.id
                        }
                        itemOnClick={(index: number) =>
                            sendMessage(
                                JSON.stringify({
                                    action: GamesRequestType.joinGame,
                                    request_id: 1,
                                    pk: gameData.pk,
                                    data: {
                                        select_1: index,
                                    },
                                })
                            )
                        }
                    />
                </div>

                {!gameData.player_2 ? (
                    gameData.player_1 !== userState.userInfo.id ? (
                        <div>
                            <div className={styles.mobileUser}>
                                <PlayerBlock userData={gameData.user_2} />
                            </div>
                            {userState.token ? SelectorBlock() : LoginBlock()}
                        </div>
                    ) : (
                        <div className={styles.gameFiedlBlockWithoutProduct}>
                            <div className={styles.mobileUser}>
                                <PlayerBlock userData={gameData.user_2} />
                            </div>

                            <GameField
                                keyValue="numbers-popup__player2__gameField__"
                                team={Team.counterTerrorist}
                                playerResult={gameData.bet_2}
                                playerChoose={gameData.select_2}
                                fieldActive={
                                    gameData.player_2 === userState.userInfo.id
                                }
                                itemOnClick={(index: number) =>
                                    sendMessage(
                                        JSON.stringify({
                                            action: GamesRequestType.joinGame,
                                            request_id: 1,
                                            pk: gameData.pk,
                                            data: {
                                                select_2: index,
                                            },
                                        })
                                    )
                                }
                            />
                        </div>
                    )
                ) : (
                    <div>
                        <div className={styles.mobileUser}>
                            <PlayerBlock userData={gameData.user_2} />
                        </div>

                        <ProductBlock userData={gameData.user_2} />
                        <GameField
                            keyValue="numbers-popup__player2__gameField__"
                            team={Team.counterTerrorist}
                            playerResult={gameData.bet_2}
                            playerChoose={gameData.select_2}
                            fieldActive={
                                gameData.player_2 === userState.userInfo.id
                            }
                            itemOnClick={(index: number) =>
                                sendMessage(
                                    JSON.stringify({
                                        action: GamesRequestType.joinGame,
                                        request_id: 1,
                                        pk: gameData.pk,
                                        data: {
                                            select_2: index,
                                        },
                                    })
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}
