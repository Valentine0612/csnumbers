import React from "react";
import { Team } from "../../../typings/teams";

import styles from "./UserImage.scss";

export default function UserImage(props: UserImageProps) {
    const getClassName = () => {
        if (props.circle)
            return !props.withTeam
                ? styles.userWithoutTeamCircle
                : props.choosenTeam === Team.terrorist
                ? styles.userTerroristCircle
                : styles.userCounterTerroristCircle;
        else
            return !props.withTeam
                ? styles.userWithoutTeam
                : props.choosenTeam === Team.terrorist
                ? styles.userTerrorist
                : styles.userCounterTerrorist;
    };

    return (
        <div className={getClassName()}>
            <img src={props.userImage} alt={props.userName} />

            {props.withTeam ? <span></span> : null}
        </div>
    );
}

type UserImageProps = {
    choosenTeam?: Team;
    userImage: string;
    userName: string;
    withTeam?: boolean;
    circle?: boolean;
};
