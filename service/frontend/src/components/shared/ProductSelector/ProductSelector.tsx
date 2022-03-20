import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { getUserItemsQuery } from "../../../api/itemsApi";
import { IState } from "../../../store";
import { Product } from "../../../typings/product";
import ProductCardMini from "../ProductCardMini";
import animations from "./ProductSelectorAnimations.scss";

export default function ProductSelector(props: ProductSelectorProps) {
    const [productsList, setProductList] = useState([]);
    const [selectedProudctIndex, setSelectedProudctIndex] = useState(-1);

    const tokenState = useSelector((state: IState) => state.user.token);
    const inventoryState = useSelector((state: IState) => state.inventory);

    const getInventory = async () => {
        props.setProductsLoaderShown(true);

        let productsList: Product[] = inventoryState;

        if (props.priceFilter)
            productsList = productsList.filter(
                (product) =>
                    Math.round(Number(product.price)) >
                        Math.round(
                            props.priceFilter.price *
                                (1 - props.priceFilter.delta)
                        ) &&
                    Math.round(Number(product.price)) <
                        Math.round(
                            props.priceFilter.price *
                                (1 + props.priceFilter.delta)
                        )
            );

        if (props.steamItemFilter)
            productsList = productsList.filter(
                (product) => product.is_steam_item
            );

        setProductList(productsList);
        setSelectedProudctIndex(0);
        props.cardOnClick(productsList[0]);

        if (props.setProductsCount) props.setProductsCount(productsList.length);

        props.setProductsLoaderShown(false);
    };

    useEffect(() => {
        getInventory();
    }, [props.priceFilter]);

    return (
        <TransitionGroup component={null}>
            {productsList.length
                ? productsList.map((elem, index) => {
                      return (
                          <CSSTransition
                              key={"product-selector__card__" + index}
                              timeout={500}
                              classNames={{
                                  appear: animations.selectorItemAppear,
                                  appearActive:
                                      animations.selectorItemAppearActive,
                                  enter: animations.selectorItemAppear,
                                  enterActive:
                                      animations.selectorItemAppearActive,
                              }}
                              //   onEnter={() => console.log("ENTER")}
                              //   onExit={() => console.log("onExit")}
                          >
                              <ProductCardMini
                                  product={elem}
                                  background={props.background}
                                  selected={selectedProudctIndex === index}
                                  cardOnClick={(product) => {
                                      props.cardOnClick(product);
                                      setSelectedProudctIndex(index);
                                  }}
                              />
                          </CSSTransition>
                      );
                  })
                : null}
        </TransitionGroup>
    );
}

type ProductSelectorProps = {
    background?: "light" | "dark" | "green";
    priceFilter?: {
        price: number;
        delta: number;
    };
    steamItemFilter?: boolean;
    cardOnClick?: (product: Product) => void;
    setProductsCount?: React.Dispatch<React.SetStateAction<number>>;
    setProductsLoaderShown: React.Dispatch<React.SetStateAction<boolean>>;
};
