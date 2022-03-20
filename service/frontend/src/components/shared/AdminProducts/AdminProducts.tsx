import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getItemQuery, getItemsByTagQuery } from "../../../api/itemsApi";
import { getTagsQuery } from "../../../api/tagsApi";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import CategoriesList from "../CategoriesList";
import Preloader from "../Preloader";
import ProductCardsList from "../ProductCardsList";

import styles from "./AdminProducts.scss";

export default function AdminProducts() {
    const [productsListState, setProductsListState] = useState([]);
    const [categoriesListState, setCategoriesListState] = useState([]);
    const [categoryState, setCategoryState] = useState({
        title: "",
    });
    const [productPreloaderState, setProductPreloaderState] = useState(false);

    const dispatch = useDispatch();

    async function getCategories() {
        const result = await getTagsQuery();

        if (result.status === 200) {
            setCategoriesListState(result.data);
        } else console.log(result);
    }

    async function getProducts() {
        setProductPreloaderState(true);

        const result = await getItemsByTagQuery(categoryState.title);

        if (result.status === 200) {
            setProductsListState(result.data);
        } else console.log(result);

        setProductPreloaderState(false);
    }

    useEffect(() => {
        getProducts();
    }, [categoryState]);

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <div>
            <h2>
                Все товары ({productsListState.length}){" "}
                {productPreloaderState ? <Preloader inline /> : null}
            </h2>

            <CategoriesList
                categories={categoriesListState}
                setCategory={setCategoryState}
                addCategory={() => dispatch(openPopup("add-category"))}
            />
            <button
                type="button"
                className={styles.addProductButton}
                onClick={() => dispatch(openPopup("add-product"))}
            >
                Добавить товар
            </button>

            <ProductCardsList
                products={productsListState}
                productButtonText="Изменить"
                background="dark"
                productButtonOnClick={(itemID?: number) =>
                    getItemQuery(itemID)
                        .then((res) => {
                            dispatch(
                                openPopup("update-product", {
                                    ...res.data,
                                    itemID: itemID,
                                })
                            );
                        })
                        .catch((err) => console.log(err))
                }
            />
        </div>
    );
}
