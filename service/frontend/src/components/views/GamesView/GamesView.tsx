import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import CoinFlipGames from "../../shared/CoinFlipGames";
import CoinFlipHeader from "../../shared/CoinFlipHeader";
import styles from "./GamesView.scss";

export default function GamesView(props: GamesViewProps) {
    const [allGamesCount, setAllGamesCount] = useState(0);
    const [acitiveGamesCount, setAcitiveGamesCount] = useState(0);
    const [allGamesPrice, setAllGamesPrice] = useState(0);

    const locationState = useLocation();
    const dispatch = useDispatch();

    const addAllGamesCount = (count: number) => {
        setAllGamesCount(allGamesCount + count);
    };

    const addAllGamesPrice = (price: number) => {
        setAllGamesPrice(allGamesPrice + price);
    };

    const addAcitiveGamesCount = (count: number) => {
        setAcitiveGamesCount(acitiveGamesCount + count);
    };

    return (
        <div className={styles.view}>
            <CoinFlipHeader
                allGamesCount={allGamesCount}
                activeGamesCount={acitiveGamesCount}
                allGamesPrice={allGamesPrice}
                buttonOnClick={() =>
                    dispatch(openPopup(props.createGamePopupName))
                }
                buttonText={props.headerButtonText}
            />

            <CoinFlipGames
                addAllGamesPrice={addAllGamesPrice}
                addAllGamesCount={addAllGamesCount}
                addAcitiveGamesCount={addAcitiveGamesCount}
                setAllGamesPrice={setAllGamesPrice}
                setAllGamesCount={setAllGamesCount}
                setAcitiveGamesCount={setAcitiveGamesCount}
                gameButtonOnClick={(data: any) =>
                    dispatch(openPopup(props.gameInfoPopupName, data))
                }
            />
        </div>
    );
}

type GamesViewProps = {
    createGamePopupName: string;
    gameInfoPopupName: string;
    headerButtonText: string;
};
