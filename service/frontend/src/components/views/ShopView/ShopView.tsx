import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { buyItemQuery, getItemsByTagQuery } from "../../../api/itemsApi";
import { getTagsQuery } from "../../../api/tagsApi";
import { IState } from "../../../store";
import { addInventoryItem } from "../../../store/actionCreators/inventoryActionCreator";
import { setUserState } from "../../../store/actionCreators/userActionCreator";
import { Product } from "../../../typings/product";
import CategoriesList from "../../shared/CategoriesList";
import Preloader from "../../shared/Preloader";
import ProductCardsList from "../../shared/ProductCardsList";
import styles from "./ShopView.scss";

function ShopView() {
    const [productsListState, setProductsListState] = useState([]);

    const [categoriesListState, setCategoriesListState] = useState([]);
    const [selectedCategoryState, setSelectedCategoryState] = useState({
        title: "",
    });
    const [productPreloaderState, setProductPreloaderState] = useState(false);

    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    async function getCategories() {
        const result = await getTagsQuery();

        if (result.status === 200) {
            setCategoriesListState(result.data);
        } else console.log(result);
    }

    async function getProducts() {
        setProductPreloaderState(true);

        const result = await getItemsByTagQuery(selectedCategoryState.title);

        if (result.status === 200) {
            setProductsListState(result.data);
        } else console.log(result);

        setProductPreloaderState(false);
    }

    async function buyProduct(itemId: number) {
        const result = await buyItemQuery(tokenState, itemId);

        if (result.status === 200) {
            dispatch(setUserState(result.data));
            dispatch(
                addInventoryItem(
                    (productsListState as Product[]).find(
                        (product) => product.pk === itemId
                    )
                )
            );
            alert("You bought item");
        } else if (result.status === 403) alert("Confirm email!");
        else if (result.status === 204) alert("You have this item!");
        else console.log(result);
    }

    useEffect(() => {
        getProducts();
    }, [selectedCategoryState]);

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <div className={styles.shop}>
            <CategoriesList
                categories={categoriesListState}
                setCategory={setSelectedCategoryState}
                lightBackgroundStyle
            />

            <h2>
                Оружие {productPreloaderState ? <Preloader inline /> : null}
            </h2>

            <ProductCardsList
                markUsersProducts
                products={productsListState}
                productButtonText="Купить"
                productButtonOnClick={buyProduct}
            />
        </div>
    );
}

export default ShopView;
