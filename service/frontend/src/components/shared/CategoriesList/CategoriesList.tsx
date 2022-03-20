import React, { useState } from "react";
import styles from "./CategoriesList.scss";

function CategoriesList(props: CategoriesListProps) {
    const [selectedIndexState, setSelectedIndexState] = useState(0);

    return (
        <ul
            className={
                props.lightBackgroundStyle
                    ? styles.darkBackgroundList
                    : styles.lightBackgroundlist
            }
        >
            <li
                className={
                    selectedIndexState === 0 ? styles.selectedCategory : styles.category
                }
                onClick={() => {
                    setSelectedIndexState(0);
                    props.setCategory("");
                }}
            >
                Все
            </li>

            {props.categories.map((category, index) => {
                return (
                    <li
                        className={
                            selectedIndexState === index + 1
                                ? styles.selectedCategory
                                : styles.category
                        }
                        onClick={() => {
                            setSelectedIndexState(index + 1);
                            props.setCategory(category);
                        }}
                        key={"categories-list-item-" + index}
                    >
                        {category.title}
                    </li>
                );
            })}

            {props.addCategory ? (
                <li className={styles.addCategory} onClick={props.addCategory}>
                    Добавить
                </li>
            ) : null}
        </ul>
    );
}

export default CategoriesList;

type CategoriesListProps = {
    categories: { title: string }[];
    setCategory: (category: any) => void;
    addCategory?: () => void;
    lightBackgroundStyle?: boolean;
};
