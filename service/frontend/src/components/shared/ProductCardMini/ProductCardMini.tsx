import React from "react";
import { Product } from "../../../typings/product";
import ProductImage from "../ProductImage";
import styles from "./ProductCardMini.scss";

export default function ProductCardMini(props: ProductCardMiniProps) {
    return (
        <div
            className={styles.item}
            onClick={() =>
                props.cardOnClick ? props.cardOnClick(props.product) : () => {}
            }
        >
            <div className={styles.productImageWrapper}>
                <ProductImage
                    productImage={props.product.image}
                    productQuality={"MW"}
                    background={props.selected ? "green" : props.background}
                />

                <div className={styles.price}>
                    {Math.round(Number(props.product.price))}
                    <span> CSC</span>
                </div>
            </div>

            <div className={styles.productName}>{props.product.title}</div>
        </div>
    );
}

type ProductCardMiniProps = {
    product: Product;
    background?: "light" | "dark" | "green";
    selected?: boolean;
    cardOnClick?: (product: Product) => void;
};
