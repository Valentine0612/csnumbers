import React from "react";
import GamesView from "../GamesView";

export default function NumbersView() {
    return (
        <GamesView
            createGamePopupName="create-numbers"
            gameInfoPopupName="numbers"
            headerButtonText="Создать числа"
        />
    );
}
