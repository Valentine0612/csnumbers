import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NavbarList.scss";

import { faCogs, faCoins, faShoppingCart, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { IState } from "../../../store";

import logoutImage from "../../../images/png/logout.png";
import { deleteTokenStorage } from "../../../localStorage/tokenStorage";

const NavbarListArray = [
    {
        to: "/console",
        text: "Консоль",
        img: <FontAwesomeIcon icon={faCogs} className={styles.fontAwesomeIcon} />,
        shouldLogin: true,
        adminAccess: true,
    },
    {
        to: "/",
        text: "Числа",
        img: <div className={styles.customIcon}>8</div>,
        shouldLogin: false,
        adminAccess: false,
    },
    {
        to: "/coinflip",
        text: "Коинфлип",
        img: <FontAwesomeIcon icon={faCoins} className={styles.fontAwesomeIcon} />,
        shouldLogin: false,
        adminAccess: false,
    },
    {
        to: "/profile",
        text: "Личный кабинет",
        img: <FontAwesomeIcon icon={faUserAlt} className={styles.fontAwesomeIcon} />,
        shouldLogin: true,
        adminAccess: false,
    },
    {
        to: "/shop",
        text: "Магазин",
        img: <FontAwesomeIcon icon={faShoppingCart} className={styles.fontAwesomeIcon} />,
        shouldLogin: false,
        adminAccess: false,
    },
    {
        to: "/help",
        text: "Поддержка",
        img: <div className={styles.customIcon}>!</div>,
        shouldLogin: true,
        adminAccess: false,
    },
];

function NavbarList(props: navbarListProps) {
    const locationState = useLocation();

    const tokenState = useSelector((state: IState) => state.user.token);
    const userState = useSelector((state: IState) => state.user.userInfo);

    function logOut() {
        deleteTokenStorage();
        location.reload();
    }

    return (
        <nav className={props.isRolledUp ? styles.rolledUpNavigation : ""}>
            <ul className={styles.list}>
                {NavbarListArray.map((item, index) => {
                    if (
                        !(item.shouldLogin && !tokenState) &&
                        !(item.adminAccess && !userState.is_staff)
                    )
                        return (
                            <li key={"navbar-list-item-" + index}>
                                <Link
                                    to={item.to}
                                    className={
                                        "/" + locationState.pathname.split("/")[1] === item.to ||
                                        "/" + locationState.pathname.split("/")[1] === item.to + "/"
                                            ? styles.listItemSelected
                                            : styles.listItem
                                    }
                                    onClick={props.itemOnClick}
                                >
                                    {item.img}
                                    <span>{item.text}</span>
                                </Link>
                            </li>
                        );
                })}

                {tokenState ? (
                    <li>
                        <div className={styles.logoutItem} onClick={logOut}>
                            <img src={logoutImage} />
                            <span>Выйти</span>
                        </div>
                    </li>
                ) : null}
            </ul>
        </nav>
    );
}

type navbarListProps = {
    itemOnClick?: () => void;
    isRolledUp?: boolean;
};

export default NavbarList;
