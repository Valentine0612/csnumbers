import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import ViewHeaderStatsItem from "../ViewHeaderStatsItem";
import styles from "./CoinFlipHeader.scss";

function CoinFlipHeader(props: CoinFlipHeaderProps) {
    const userInfoState = useSelector((state: IState) => state.user.userInfo);
    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();
    const locationState = useLocation();

    return (
        <div className={styles.coinFlipStats}>
            <div className={styles.stats}>
                <div className={styles.statsItem}>
                    <ViewHeaderStatsItem
                        count={props.activeGamesCount}
                        text={"активных игр"}
                    />
                </div>
                <div className={styles.statsItem}>
                    <ViewHeaderStatsItem
                        count={props.allGamesPrice}
                        text={"общая сумма"}
                    />
                </div>
                <div className={styles.statsItem}>
                    <ViewHeaderStatsItem
                        count={props.allGamesCount}
                        text={"всего игр"}
                    />
                </div>
            </div>

            {tokenState ? (
                <div className={styles.statsAndButton}>
                    <div className={styles.stats}>
                        <div className={styles.statsItem}>
                            <ViewHeaderStatsItem
                                count={
                                    locationState.pathname.replace(
                                        /\//g,
                                        ""
                                    ) === ""
                                        ? userInfoState.digits
                                        : userInfoState.coinflips
                                }
                                text={
                                    locationState.pathname.replace(
                                        /\//g,
                                        ""
                                    ) === ""
                                        ? "мои игры"
                                        : "мои коинфлипы"
                                }
                            />
                        </div>
                        <div className={styles.statsItem}>
                            <ViewHeaderStatsItem
                                count={userInfoState.balance}
                                text={"моя сумма"}
                            />
                        </div>
                    </div>

                    <button
                        className={styles.button}
                        type="button"
                        onClick={props.buttonOnClick}
                    >
                        {props.buttonText}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default CoinFlipHeader;

type CoinFlipHeaderProps = {
    activeGamesCount: number;
    allGamesCount: number;
    allGamesPrice: number;
    buttonOnClick: () => void;
    buttonText: string;
};
