import React from "react";
import ProductInfoCircle from "../ProductInfoCircle";
import { ProductInfoCircleTypes } from "../ProductInfoCircle/ProductInfoCircle";

import styles from "./ProductImage.scss";

export default function ProductImage(props: ProductImageProps) {
    const getBackgroundStyle = (): string => {
        switch (props.background) {
            case "dark":
                return styles.darkBackgroundImage;

            case "green":
                return styles.greenBackgroundImage;

            default:
                return styles.lightBackgroundImage;
        }
    };

    return (
        <div className={getBackgroundStyle()}>
            <img src={props.productImage} className={styles.image} />

            <div className={styles.infoCircles}>
                {props.isUserHasItem ? (
                    <ProductInfoCircle
                        type={ProductInfoCircleTypes.usersItem}
                    />
                ) : null}

                {props.isSteamItem ? (
                    <ProductInfoCircle
                        type={ProductInfoCircleTypes.steamItem}
                    />
                ) : null}
            </div>

            {/* <span>{props.productQuality}</span> */}
        </div>
    );
}

type ProductImageProps = {
    productImage: string;
    productQuality: string;
    isSteamItem?: boolean;
    isUserHasItem?: boolean;
    background?: "light" | "dark" | "green";
};
