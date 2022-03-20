import React from "react";
import { useSelector } from "react-redux";
import { IState } from "../../../store";
import { Product } from "../../../typings/product";
import ProductImage from "../ProductImage";
import styles from "./ProductCard.scss";

function ProductCard(props: ProductCardProps) {
    const inventoryState = useSelector((state: IState) => state.inventory);

    return (
        <div className={styles.item}>
            <div className={styles.productImage}>
                <ProductImage
                    productImage={props.product.image}
                    isSteamItem={props.product.is_steam_item}
                    isUserHasItem={Boolean(
                        props.markIfUserHas &&
                            inventoryState.find(
                                (inventoryProduct) =>
                                    inventoryProduct.pk === props.product.pk
                            )
                    )}
                    productQuality={"MW"}
                    background={props.background}
                />
            </div>

            <div className={styles.rightBlock}>
                <div>
                    <span className={styles.price}>
                        {props.product.price + " CSCoins"}
                    </span>
                    {props.product.title}
                </div>

                <div className={styles.buttonsBlock}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={props.buttonOnClick}
                    >
                        {props.buttonText}
                    </button>

                    {props.steamButtonOnClick && props.product.is_steam_item ? (
                        <button
                            type="button"
                            className={styles.button}
                            onClick={props.steamButtonOnClick}
                        >
                            Вывести
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

type ProductCardProps = {
    product: Product;
    markIfUserHas?: boolean;
    background?: "light" | "dark" | "green";
    buttonText: string;
    buttonOnClick: () => void;
    steamButtonOnClick?: () => void;
};

export default ProductCard;
