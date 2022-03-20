import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteTokenStorage } from "../../../localStorage/tokenStorage";
import { IState } from "../../../store";
import HeaderCashInfo from "../HeaderCashInfo";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Header.scss";

import logoFireSVG from "../../../images/svg/logoFire.svg";
import logoTextSVG from "../../../images/svg/logoText.svg";
import logoutImage from "../../../images/png/logout.png";

import Navbar from "../Navbar";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";

function Header() {
    const [navbarShownState, setNavbarShownState] = useState(false);

    const tokenState = useSelector((state: IState) => state.user.token);
    const usernameState = useSelector((state: IState) => state.user.userInfo.username);
    const avatarState = useSelector(
        (state: IState) => state.user.userInfo.avatar_url || state.user.userInfo.avatar
    );

    const dispatch = useDispatch();

    const infoLinks = [
        {
            text: "FAQ",
            link: "/faq",
        },
        {
            text: "Правила и условия",
            link: "/rules",
        },
        {
            text: "Политика конфиденциальности",
            link: "/confidentiality",
        },
    ];

    function logOut() {
        deleteTokenStorage();
        location.reload();
    }

    function toggleNavbarShownState() {
        setNavbarShownState(!navbarShownState);
    }

    return (
        <div className={styles.mobileHeaderBlock}>
            <div className={styles.header}>
                {/* <ul className={styles.linksList}>
                    {infoLinks.map((elem, index) => (
                        <li key={"header-link-" + index}>
                            <Link to={elem.link}>{elem.text}</Link>
                        </li>
                    ))}
                </ul> */}

                <Link to="/" className={styles.logoCSGames}>
                    {/* <img src={logoFireSVG} alt="CSGames" /> */}
                    <img src={logoTextSVG} alt="CSGames" className={styles.logoText} />
                </Link>

                <div className={styles.headerCashInfoBlock}>
                    <div className={styles.headerCashInfo}>
                        <HeaderCashInfo />
                    </div>

                    {tokenState ? (
                        <div className={styles.accountBlock}>
                            <Link to="/profile" className={styles.avatarWrapper}>
                                <img
                                    src={avatarState}
                                    alt={usernameState}
                                    className={styles.avatarImage}
                                />
                            </Link>

                            <img
                                src={logoutImage}
                                className={styles.signOutButton}
                                onClick={logOut}
                            />
                        </div>
                    ) : (
                        <>
                            <button
                                className={styles.loginButton}
                                type="button"
                                onClick={() => dispatch(openPopup("login"))}
                            >
                                Войти
                            </button>

                            <FontAwesomeIcon
                                icon={faUser}
                                className={styles.loginIcon}
                                onClick={() => dispatch(openPopup("login"))}
                            />
                        </>
                    )}
                </div>

                <FontAwesomeIcon
                    icon={faBars}
                    className={styles.navbarBurger}
                    onClick={toggleNavbarShownState}
                />
            </div>

            {navbarShownState ? (
                <Navbar className={styles.navbar} itemOnClick={() => setNavbarShownState(false)} />
            ) : null}
        </div>
    );
}

export default Header;
