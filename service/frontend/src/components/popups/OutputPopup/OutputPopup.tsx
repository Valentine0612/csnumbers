import React, { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createOutputBalanceQuery,
    createOutputItemQuery,
} from "../../../api/outputApi";
import { IState } from "../../../store";
import { closePopup } from "../../../store/actionCreators/popupActionCreator";
import { Product } from "../../../typings/product";
import { wallets } from "../../../typings/wallets";
import ProductSelector from "../../shared/ProductSelector";
import styles from "./OutputPopup.scss";

const navigationList = ["Скины", "Баланс"];

export default function OutputPopup() {
    const [selectedNavigation, setSelectedNavigation] = useState(0);
    const [choosenGunState, setChoosenGunState] = useState<Product>();
    const [outputPrice, setOutputPrice] = useState<number>();
    const [chosenWallet, setChosenWallet] = useState<string>(
        wallets.QMONEY.name
    );
    const [outputWalletID, setOutputWalletID] = useState<number>();

    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    const skinsOutput = () => (
        <div className={styles.productSelector}>
            <ProductSelector
                background="dark"
                cardOnClick={(product) => setChoosenGunState(product)}
                setProductsLoaderShown={() => {}}
                steamItemFilter
            />
        </div>
    );

    const balanceOutput = () => (
        <>
            <input
                type="text"
                placeholder="Номер счета"
                className={styles.walletInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (!isNaN(Number(event.target.value)))
                        setOutputWalletID(Number(event.target.value));
                    else event.target.value = String(outputWalletID || "");
                }}
            />

            <div className={styles.walletSelector}>
                {Object.entries(wallets).map((item) => (
                    <div
                        className={
                            chosenWallet === item[1].name
                                ? styles.walletSelectorSelectedItem
                                : styles.walletSelectorItem
                        }
                        onClick={() => setChosenWallet(item[1].name)}
                    >
                        {item[1].title}
                    </div>
                ))}
            </div>
        </>
    );

    async function outputItemAction() {
        const result = await createOutputItemQuery(
            tokenState,
            choosenGunState.pk
        );
        console.log(result);

        if (result.status === 200) {
            alert(
                "Успешно! Ваш запрос будет обработан администрацией в ближайшее время"
            );
            dispatch(closePopup());
            return;
        }

        if (result.status === 208) {
            alert("Ошибка! Вы уже создали запрос на вывод предмета");
            return;
        }

        if (result.status === 206) {
            alert("Ошибка! У вас нет ссылки на Steam в профиле");
            return;
        }

        alert("Ошибка!");
        console.log(result);
    }

    async function outputBalanceAction() {
        if (outputPrice <= 50) {
            alert("Ошибка! Можно выводить только более 50 рублей");
            return;
        }

        if (!outputPrice) {
            alert("Ошибка! Не введена сумма вывода");
            return;
        }

        if (!outputWalletID) {
            alert("Ошибка! Не введен счет вывода");
            return;
        }

        const result = await createOutputBalanceQuery(
            tokenState,
            outputPrice,
            chosenWallet,
            outputWalletID
        );
        console.log(result);

        if (result.status === 201) {
            alert(
                "Успешно! Ваш запрос будет обработан администрацией в ближайшее время"
            );
            dispatch(closePopup());
            return;
        }

        if (result.status === 208) {
            alert("Ошибка! Вы уже создали запрос на вывод средств");
            return;
        }

        alert("Ошибка!");
        console.log(result);
    }

    return (
        <>
            <h3>Запрос на вывод</h3>

            <div className={styles.main}>
                <ul className={styles.navbar}>
                    {navigationList.map((item, index) => (
                        <li
                            key={"output-popup__navigation__" + index}
                            className={
                                index === selectedNavigation
                                    ? styles.selectedItem
                                    : null
                            }
                            onClick={() => setSelectedNavigation(index)}
                        >
                            {item}
                        </li>
                    ))}
                </ul>

                <div className={styles.window}>
                    <div className={styles.topBlock}>
                        {selectedNavigation === 1 ? (
                            <input
                                type="text"
                                placeholder="Сумма вывода"
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>
                                ) => {
                                    if (!isNaN(Number(event.target.value)))
                                        setOutputPrice(
                                            Number(event.target.value)
                                        );
                                    else
                                        event.target.value = String(
                                            outputPrice || ""
                                        );
                                }}
                            />
                        ) : null}

                        {selectedNavigation === 0 ? (
                            <div className={styles.productSelectorTitle}>
                                Ваши предметы:
                            </div>
                        ) : null}

                        <button
                            onClick={() => {
                                switch (selectedNavigation) {
                                    case 0:
                                        outputItemAction();
                                        return;

                                    case 1:
                                        outputBalanceAction();
                                        return;
                                }
                            }}
                        >
                            Вывести
                        </button>
                    </div>

                    {selectedNavigation === 0 ? skinsOutput() : null}
                    {selectedNavigation === 1 ? balanceOutput() : null}
                </div>
            </div>
        </>
    );
}
