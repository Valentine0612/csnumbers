import { faChevronDown, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
    createItemQuery,
    deleteItemQuery,
    getItemQuery,
    updateItemQuery,
} from "../../../api/itemsApi";
import { getTagsQuery } from "../../../api/tagsApi";
import { IState } from "../../../store";
import FormError from "../../shared/FormError";
import ProductImage from "../../shared/ProductImage";
import styles from "./ManageProductPopup.scss";

export default function ManageProductPopup() {
    const tokenState = useSelector((state: IState) => state.user.token);
    const popupState = useSelector((state: IState) => state.popup);

    const [dataState, setDataState] = useState<any>({});

    // TODO: add hook
    const isUpdating = popupState.type === "update-product";

    const { register, handleSubmit, errors, setError, clearErrors } = useForm();
    const [srcAvatarState, setSrcAvatarState] = useState("");
    const [categoriesListState, setCategoriesListState] = useState([]);
    const [selectedCategoryState, setSelectedCategoryState] = useState("");
    const [categoriesListShownState, setCategoriesListShownState] =
        useState(false);
    const [isSteamItem, setIsSteamItem] = useState(false);

    const locationState = useLocation();

    async function getAllCategories() {
        const result = await getTagsQuery();
        if (result.status === 200) {
            setCategoriesListState(result.data);
        } else console.log(result);
    }

    function uploadImageOnChange(
        event: React.ChangeEvent<HTMLInputElement>
    ): null | void {
        clearErrors("avatar");
        setSrcAvatarState("");
        console.log(event.target.files);
        if (event.target.files.length > 0) {
            let file = event.target.files[0];

            if (file.size > 2097152) {
                setError("image", {
                    type: "To large",
                    message: "Аватар слишком большого размера (макс. 2МВ)",
                });
                return null;
            }

            if (file.type.split("/")[0] !== "image") {
                setError("image", {
                    type: "Incorrect format",
                    message:
                        "Неккоректный формат для аватара (требуется изображение)",
                });
                return null;
            }

            let reader = new FileReader();
            reader.onload = (event) => {
                setSrcAvatarState(event.target.result.toString());
            };
            reader.readAsDataURL(file);
        }
    }

    async function manageProduct(data: any) {
        if (selectedCategoryState === "")
            setError("tag", {
                type: "Tag is null",
                message: "Категория - обязательное поле",
            });
        else if (isUpdating) updateProduct(data);
        else addProduct(data);
    }

    async function addProduct(data: any) {
        if (!data.image[0])
            setError("image", {
                type: "Image required",
                message: "Требуется изображение товара",
            });
        else {
            let productData = new FormData();

            productData.append("image", data.image[0]);
            productData.append("title", data.title);
            productData.append("price", data.price);
            productData.append("is_steam_item", data.steamItem);
            productData.append("tag", selectedCategoryState);

            const result = await createItemQuery(tokenState, productData);

            if (result.status === 201) location.replace(locationState.pathname);
            else console.log(result);
        }
    }

    async function updateProduct(data: any) {
        let productData = new FormData();

        if (data.image[0]) productData.append("image", data.image[0]);
        productData.append("title", data.title);
        productData.append("price", data.price);
        productData.append("is_steam_item", data.steamItem);
        productData.append("tag", selectedCategoryState);

        const result = await updateItemQuery(
            tokenState,
            dataState.itemID,
            productData
        );

        if (result.status === 200) location.replace(locationState.pathname);
        else console.log(result);
    }

    async function deleteProduct() {
        const result = await deleteItemQuery(tokenState, dataState.itemID);
        if (result.status === 204) location.replace(locationState.pathname);
        else console.log(result);
    }

    useEffect(() => {
        getAllCategories();
    }, []);

    useEffect(() => {
        if (popupState.data) {
            setDataState(popupState.data);
            setSrcAvatarState(
                popupState.data.image ||
                    "https://konyakov.ru/pubs/transparent-textures/patterns/asfalt-light.png"
            );
            setSelectedCategoryState(popupState.data.tag || "");
            setIsSteamItem(popupState.data.is_steam_item);
        } else setDataState({});
    }, [popupState.data]);

    useEffect(() => {
        clearErrors("tag");
    }, [selectedCategoryState]);

    console.log(dataState);

    return (
        <>
            <h3>Добавить товар</h3>
            <form onSubmit={handleSubmit(manageProduct)}>
                <div className={styles.flexBox}>
                    <div
                        className={
                            errors.image
                                ? styles.errorImageBlock
                                : styles.imageBlock
                        }
                    >
                        <input
                            type="file"
                            name="image"
                            id="product-image"
                            className={styles.imageInput}
                            ref={register}
                            onChange={uploadImageOnChange}
                            multiple={false}
                        />

                        <ProductImage
                            productQuality="MW"
                            productImage={srcAvatarState}
                            background="dark"
                        />

                        <label
                            htmlFor="product-image"
                            className={styles.imageInputLabel}
                        >
                            <FontAwesomeIcon icon={faCog} />
                        </label>
                    </div>

                    <div className={styles.inputsBlock}>
                        <input
                            type="text"
                            name="title"
                            className={
                                errors.title ? styles.errorInput : styles.input
                            }
                            placeholder="Название"
                            ref={register({
                                required: "Название - обязательное поле",
                            })}
                            defaultValue={dataState.title || ""}
                        />

                        <input
                            type="text"
                            name="price"
                            className={
                                errors.price ? styles.errorInput : styles.input
                            }
                            placeholder="Цена"
                            ref={register({
                                required: "Цена - обязательное поле",
                                pattern: {
                                    value: /^(\d+(\.\d+)?)$/,
                                    message: "Цена должна быть числом",
                                },
                            })}
                            defaultValue={dataState.price || ""}
                        />
                    </div>
                </div>

                <div
                    className={styles.customSelect}
                    onClick={(event) =>
                        setCategoriesListShownState(!categoriesListShownState)
                    }
                >
                    <div className={styles.selectedOption}>
                        {selectedCategoryState === ""
                            ? "Категория"
                            : selectedCategoryState}
                        <div
                            className={
                                categoriesListShownState
                                    ? styles.selectedOptionArrowOpened
                                    : styles.selectedOptionArrow
                            }
                        >
                            <FontAwesomeIcon icon={faChevronDown} />
                        </div>
                    </div>

                    <div className={styles.optionsBlock}>
                        {categoriesListShownState
                            ? categoriesListState.map((elem, index) => (
                                  <div
                                      className={styles.option}
                                      onClick={(event) =>
                                          setSelectedCategoryState(elem.title)
                                      }
                                      key={
                                          "add-product__select-option__" + index
                                      }
                                  >
                                      {elem.title}
                                  </div>
                              ))
                            : null}
                    </div>
                </div>

                <div className={styles.checkbox}>
                    <input
                        type="checkbox"
                        name="steamItem"
                        id="steamItem"
                        checked={isSteamItem}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setIsSteamItem(event.target.checked)
                        }
                        ref={register()}
                    />
                    <label htmlFor="steamItem">Разрешить вывод в стим</label>
                </div>

                <FormError keyValue="add-product-form" errors={errors} />

                <div className={styles.buttonsBlock}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        autoFocus
                    >
                        {isUpdating ? "Изменить" : "Добавить"}
                    </button>
                    {isUpdating ? (
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={deleteProduct}
                        >
                            Удалить
                        </button>
                    ) : null}
                </div>
            </form>
        </>
    );
}
