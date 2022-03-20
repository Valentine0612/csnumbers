import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWebSocket from "react-use-websocket";
import { IState } from "../../../store";
import { closePopup } from "../../../store/actionCreators/popupActionCreator";
import { Team } from "../../../typings/teams";
import { GamesRequestType } from "../../../websocket/coinflipWebsocket";
import PleaseLogin from "../../shared/PleaseLogin";
import Preloader from "../../shared/Preloader";
import ProductSelector from "../../shared/ProductSelector";
import styles from "./CreateGamePopup.scss";
import terroristImage from "../../../images/png/terroristIconBig.png";
import counterTerroristImage from "../../../images/png/counterTerroristIconBig.png";
import { useHistory } from "react-router-dom";
import { deleteInventoryItem } from "../../../store/actionCreators/inventoryActionCreator";

export default function CreateGamePopup(props: CreateGamePopupProps) {
    const [choosenGunState, setChoosenGunState] = useState(null);
    const [choosenTerroristTeamState, setChoosenTerroristTeamState] = useState(
        Team.terrorist
    );
    const [gameCreatedStated, setGameCreatedStated] = useState(false);
    const [productsCount, setProductsCount] = useState(0);
    const [productsLoaderShown, setProductsLoaderShown] = useState(true);

    const tokenState = useSelector((state: IState) => state.user.token);
    const userIDState = useSelector((state: IState) => state.user.userInfo.id);

    const { sendMessage, lastMessage } = useWebSocket(
        props.websocketURL + "?token=" + tokenState
    );

    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        // Open coinflip popup after creating game
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data);

            if (
                gameCreatedStated &&
                data.action === GamesRequestType.newGame &&
                data.data.player_1 === userIDState &&
                data.data.item_1 === choosenGunState.pk
            ) {
                props.openPopup(data.data);
            }
        }
    }, [lastMessage]);

    function createGame() {
        console.log(choosenGunState);

        if (choosenGunState) {
            setGameCreatedStated(true);

            dispatch(deleteInventoryItem(choosenGunState.pk));

            sendMessage(
                JSON.stringify({
                    action: GamesRequestType.newGame,
                    request_id: 1,
                    data: props.teamChooseAvailable
                        ? {
                              item_1: choosenGunState.pk,
                              bet_1: choosenTerroristTeamState,
                          }
                        : {
                              item_1: choosenGunState.pk,
                          },
                })
            );
        }
    }

    return tokenState ? (
        <>
            <h3 className={styles.title}>{props.title}</h3>

            <div className={styles.view}>
                <div className={styles.rightBlock}>
                    {props.teamChooseAvailable ? (
                        <div className={styles.playersChoose}>
                            <div
                                className={
                                    choosenTerroristTeamState
                                        ? styles.choosen
                                        : ""
                                }
                                onClick={() => {
                                    setChoosenTerroristTeamState(
                                        Team.terrorist
                                    );
                                }}
                            >
                                <img src={terroristImage} alt="Решка" />
                                <span>Террористы</span>
                            </div>
                            <div
                                className={
                                    !choosenTerroristTeamState
                                        ? styles.choosen
                                        : ""
                                }
                                onClick={() => {
                                    setChoosenTerroristTeamState(
                                        Team.counterTerrorist
                                    );
                                }}
                            >
                                <img src={counterTerroristImage} alt="Орел" />
                                <span>Контртеррористы</span>
                            </div>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        className={styles.button}
                        onClick={createGame}
                    >
                        Создать
                    </button>
                </div>

                <div className={styles.productSelectorWrapper}>
                    <div className={styles.productSelectorTitle}>
                        Ваши предметы ({productsCount})
                        {productsLoaderShown ? <Preloader inline /> : null}
                    </div>

                    {!productsLoaderShown && productsCount <= 0 ? (
                        <button
                            className={styles.productSelectorButton}
                            onClick={() => {
                                history.push("/shop");
                                dispatch(closePopup());
                            }}
                        >
                            В магазин
                        </button>
                    ) : null}

                    <div className={styles.productSelector}>
                        <ProductSelector
                            background="dark"
                            cardOnClick={(product) =>
                                setChoosenGunState(product)
                            }
                            setProductsCount={setProductsCount}
                            setProductsLoaderShown={setProductsLoaderShown}
                        />
                    </div>
                </div>
            </div>
        </>
    ) : (
        <PleaseLogin />
    );
}

type CreateGamePopupProps = {
    title: string;
    teamChooseAvailable?: boolean;
    websocketURL: string;
    openPopup: (data: any) => void;
};
