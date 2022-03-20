import React, { useEffect, useState } from "react";
import { Team } from "../../../typings/teams";
import styles from "./GameField.scss";
import fieldCoinCT from "../../../images/png/fieldCoinCT.png";
import fieldCoinT from "../../../images/png/fieldCoinT.png";

export default function GameField(props: GameFieldProps) {
    const [canBeClicked, setCanBeClicked] = useState(false);
    const [choosedField, setChoosedField] = useState<number>();

    useEffect(() => {
        if (props.playerResult && props.fieldActive && !props.playerChoose)
            setCanBeClicked(true);
        else setCanBeClicked(false);

        if (props.playerChoose) setChoosedField(props.playerChoose);
        else setChoosedField(null);
    }, [props.playerChoose, props.playerResult, props.fieldActive]);

    return (
        <div className={styles.gameField}>
            {(() => {
                let result: JSX.Element[] = [];

                for (let index = 1; index <= 9; index++) {
                    result.push(
                        <div
                            className={styles.fieldItem}
                            key={props.keyValue + index}
                        >
                            {choosedField !== index ? (
                                <img
                                    src={
                                        props.team === Team.counterTerrorist
                                            ? fieldCoinCT
                                            : fieldCoinT
                                    }
                                    alt="fieldCoint"
                                    className={styles.fieldCoin}
                                    onClick={() => {
                                        if (canBeClicked && !choosedField) {
                                            setChoosedField(index);
                                            setCanBeClicked(false);
                                            props.itemOnClick(index);
                                        }
                                    }}
                                    style={{
                                        cursor:
                                            canBeClicked && props.fieldActive
                                                ? "pointer"
                                                : "default",
                                    }}
                                />
                            ) : (
                                <div className={styles.fieldCoinChoosen}>
                                    {props.playerResult}
                                </div>
                            )}
                        </div>
                    );
                }

                return result;
            })()}
        </div>
    );
}

type GameFieldProps = {
    keyValue: string;
    team: Team;
    playerResult?: number;
    playerChoose?: number;
    fieldActive?: boolean;
    itemOnClick: (index: number) => void;
};
