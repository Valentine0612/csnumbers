import React from "react";
import GamesView from "../GamesView";

export default function CoinflipsView() {
    return (
        <GamesView
            createGamePopupName="create-coinflip"
            gameInfoPopupName="coinflip"
            headerButtonText="Создать коинфлип"
        />
    );
}
