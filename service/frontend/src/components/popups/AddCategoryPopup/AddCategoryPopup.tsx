import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { createTagQuery } from "../../../api/tagsApi";
import { IState } from "../../../store";
import FormError from "../../shared/FormError";
import styles from "./AddCategoryPopup.scss";

export default function AddCategoryPopup() {
    const { register, handleSubmit, errors, setError } = useForm();
    const [categoryNameState, setCategoryNameState] = useState("");
    const tokenState = useSelector((state: IState) => state.user.token);
    const locationState = useLocation();

    async function createCategory() {
        const result = await createTagQuery(tokenState, categoryNameState);

        if (result.status === 201) {
            location.replace(locationState.pathname);
        } else if (
            result.status == 400 &&
            result.data.title &&
            result.data.title[0] === "tag with this title already exists."
        )
            setError("title", {
                type: "Title already exists",
                message: "Категория с таким названием уже существует",
            });
        else console.log(result);
    }

    return (
        <>
            <h3>Добавить категорию</h3>
            <form onSubmit={handleSubmit(createCategory)}>
                <input
                    type="text"
                    name="title"
                    className={styles.input}
                    placeholder="Название категории"
                    onChange={(event) => setCategoryNameState(event.target.value)}
                    ref={register({
                        required: "Название категории - обязательное поле",
                    })}
                />

                <FormError keyValue="create-category-form" errors={errors} />

                <button type="submit" className={styles.button} autoFocus>
                    Добавить
                </button>
            </form>
        </>
    );
}
