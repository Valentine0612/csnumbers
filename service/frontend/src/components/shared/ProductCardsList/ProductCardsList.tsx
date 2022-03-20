import React from "react";
import { useSelector } from "react-redux";
import { IState } from "../../../store";
import { Product } from "../../../typings/product";
import ProductCard from "../ProductCard";
import styles from "./ProductCardsList.scss";

export default function ProductCardsList(props: ProductCardsListProps) {
    const inventoryState = useSelector((state: IState) => state.inventory);

    return props.products.length ? (
        <ul className={styles.list}>
            {props.products.map((item, index) => {
                return (
                    <li key={"shop-item" + index}>
                        <ProductCard
                            product={item}
                            markIfUserHas={props.markUsersProducts}
                            buttonText={props.productButtonText}
                            background={props.background}
                            buttonOnClick={() =>
                                props.productButtonOnClick(item.pk)
                            }
                            {...{
                                steamButtonOnClick:
                                    props.productSteamButtonOnClick
                                        ? () =>
                                              props.productSteamButtonOnClick(
                                                  item.pk
                                              )
                                        : undefined,
                            }}
                        />
                    </li>
                );
            })}
        </ul>
    ) : (
        <div>Список пуст</div>
    );
}

type ProductCardsListProps = {
    products: Product[];
    productButtonText: string;
    productButtonOnClick: (itemId?: number) => void;
    productSteamButtonOnClick?: (itemId?: number) => void;
    background?: "light" | "dark" | "green";
    markUsersProducts?: boolean;
};
