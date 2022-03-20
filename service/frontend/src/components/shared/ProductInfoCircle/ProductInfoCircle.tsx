import React from "react";
import steamLogo from "../../../images/png/steam.png";
import userImage from "../../../images/png/user.png";
import styles from "./ProductInfoCircle.scss";

export default function ProductInfoCircle(props: ProductInfoCircleProps) {
    return (
        <div className={styles.background}>
            {infoList
                .filter((item) => item.type === props.type)
                .map((item, index) => (
                    <img
                        src={item.image}
                        alt={item.image}
                        key={"productInfo" + index}
                    />
                ))}
        </div>
    );
}

type ProductInfoCircleProps = {
    type: ProductInfoCircleTypes;
};

export enum ProductInfoCircleTypes {
    steamItem = "steamItem",
    usersItem = "usersItem",
}

const infoList = [
    {
        type: ProductInfoCircleTypes.steamItem,
        image: steamLogo,
        imageAlt: "Steam logo",
    },
    {
        type: ProductInfoCircleTypes.usersItem,
        image: userImage,
        imageAlt: "User",
    },
];
