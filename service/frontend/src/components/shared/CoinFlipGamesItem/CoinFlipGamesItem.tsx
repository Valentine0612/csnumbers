import React from "react";
import styles from "./CoinFlipGamesItem.scss";

import ProductImage from "../ProductImage";
import UserImage from "../UserImage";

export default function CoinFlipGamesItem(props: CoinFlipGameItemProps) {
    return (
        <div className={styles.game}>
            <div className={styles.images}>
                <div className={styles.usersBlock}>
                    <div className={styles.userImageWrapper}>
                        <UserImage
                            choosenTeam={props.player1.choose}
                            userImage={props.player1.profileImage}
                            userName={props.player1.profileName}
                            withTeam={props.withTeam}
                        />
                    </div>
                    {props.player2 ? (
                        <>
                            <div className={styles.vsBlock}>VS</div>
                            <div className={styles.userImageWrapper}>
                                <UserImage
                                    choosenTeam={props.player2.choose}
                                    userImage={props.player2.profileImage}
                                    userName={props.player2.profileName}
                                    withTeam={props.withTeam}
                                />
                            </div>
                        </>
                    ) : null}
                </div>

                <div className={styles.gunsBlock}>
                    <div className={styles.gunImageWrapper}>
                        <ProductImage
                            productImage={props.gun1.gunImage}
                            productQuality={""}
                            background="dark"
                        />
                    </div>

                    {props.gun2 ? (
                        <div className={styles.gunImageWrapper}>
                            <ProductImage
                                productImage={props.gun2.gunImage}
                                productQuality={""}
                                background="dark"
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            <div className={styles.rightBlock}>
                <div className={styles.priceInfo}>
                    <div className={styles.mainPrice}>
                        {props.gamePrice}
                        <span> CSCoins</span>
                    </div>
                    {props.lowerPrice} - {props.upperPrice} CSCoins
                </div>

                <button
                    type="button"
                    className={styles.button}
                    onClick={props.buttonOnClickCallback}
                >
                    Смотреть
                </button>
            </div>
        </div>
    );
}

type CoinFlipGameItemProps = {
    player1: {
        profileImage: string;
        profileName: string;
        choose?: number;
    };

    player2?: {
        profileImage: string;
        profileName: string;
        choose?: number;
    };

    gun1: {
        gunImage: string;
        gunName: string;
    };

    gun2?: {
        gunImage: string;
        gunName: string;
    };

    gamePrice: number;
    lowerPrice: number;
    upperPrice: number;
    withTeam?: boolean;
    buttonOnClickCallback: () => void;
};
