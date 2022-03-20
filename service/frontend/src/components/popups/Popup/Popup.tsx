import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store";
import { closePopup } from "../../../store/actionCreators/popupActionCreator";
import AddCategoryPopup from "../AddCategoryPopup";
import ManageProductPopup from "../ManageProductPopup";
import CreateCoinFlipPopup from "../CreateCoinFlipPopup";
import LoginPopup from "../LoginPopup";
import RegisterPopup from "../RegisterPopup";
import styles from "./Popup.scss";
import animations from "./PopupAnimations.scss";
import CoinFlipPopup from "../CoinFlipPopup";
import { CSSTransition } from "react-transition-group";
import CreateNumbersPopup from "../CreateNumbersPopup";
import NumbersPopup from "../NumbersPopup";
import TopupBalancePopup from "../TopupBalancePopup";
import OutputPopup from "../OutputPopup";
import AdminOutputBalancePopup from "../AdminOutputBalancePopup";
import AdminOutputItemPopup from "../AdminOutputItemPopup";
import ReferalPopup from "../ReferalPopup";
import AdminUserPopup from "../AdminUserPopup";

function Popup() {
    const tokenState = useSelector((state: IState) => state.user.token);
    const popupState = useSelector((state: IState) => state.popup);

    const dispatch = useDispatch();

    const [currentPopupState, setCurrentPopupState] = useState({
        isActive: false,
        popupComponent: null,
    });

    const popupsComponents = [
        {
            query: "login",
            component: LoginPopup,
            showIfLoggedIn: false,
        },
        {
            query: "register",
            component: RegisterPopup,
            showIfLoggedIn: false,
        },
        {
            query: "create-coinflip",
            component: CreateCoinFlipPopup,
            showIfLoggedIn: true,
        },
        {
            query: "create-numbers",
            component: CreateNumbersPopup,
            showIfLoggedIn: true,
        },
        {
            query: "add-product",
            component: ManageProductPopup,
            showIfLoggedIn: true,
        },
        {
            query: "update-product",
            component: ManageProductPopup,
            showIfLoggedIn: true,
        },
        {
            query: "add-category",
            component: AddCategoryPopup,
            showIfLoggedIn: true,
        },
        {
            query: "coinflip",
            component: CoinFlipPopup,
            showIfLoggedIn: true,
        },
        {
            query: "numbers",
            component: NumbersPopup,
            showIfLoggedIn: true,
        },
        {
            query: "topup-balance",
            component: TopupBalancePopup,
            showIfLoggedIn: true,
        },
        {
            query: "output",
            component: OutputPopup,
            showIfLoggedIn: true,
        },
        {
            query: "admin-output-balance",
            component: AdminOutputBalancePopup,
            showIfLoggedIn: true,
        },
        {
            query: "admin-output-item",
            component: AdminOutputItemPopup,
            showIfLoggedIn: true,
        },
        {
            query: "referal",
            component: ReferalPopup,
            showIfLoggedIn: true,
        },
        {
            query: "admin-user",
            component: AdminUserPopup,
            showIfLoggedIn: true,
        },
    ];

    useEffect(() => {
        let isActive: boolean = false;
        let popupComponent: any = null;

        if (popupState.isOpened) {
            popupsComponents.some((element) => {
                if (element.query === popupState.type) {
                    // Not true if user logged and element not shows when logged
                    if (!(Boolean(tokenState) && !element.showIfLoggedIn)) {
                        isActive = true;
                        popupComponent = element.component;
                    } else dispatch(closePopup());

                    return true;
                }
            });
        }

        setCurrentPopupState({
            isActive: isActive,
            popupComponent: popupComponent,
        });
    }, [popupState]);

    const closePopupOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        if (event.currentTarget === event.target) {
            dispatch(closePopup());
        }
    };

    return (
        <CSSTransition
            in={currentPopupState.isActive}
            timeout={200}
            classNames={{
                enter: animations.popupEnter,
                enterActive: animations.popupEnterActive,
                exit: animations.popupExit,
                exitActive: animations.popupExitActive,
            }}
            unmountOnExit
        >
            <div className={styles.wrapper} onClick={closePopupOnClick}>
                <div className={styles.wrapperInner} onClick={closePopupOnClick}>
                    <div className={styles.popup}>
                        <div className={styles.closeButton} onClick={closePopupOnClick}>
                            +
                        </div>

                        <div className={styles.popupView}>
                            {currentPopupState.isActive ? (
                                <currentPopupState.popupComponent />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
}

export default Popup;
