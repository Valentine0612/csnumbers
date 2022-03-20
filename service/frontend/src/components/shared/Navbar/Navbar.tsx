import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavbarList from "../NavbarList";

import styles from "./Navbar.scss";

// import logoFireSVG from "../../../images/svg/logoFire.svg";
import logoTextSVG from "../../../images/svg/logoText.svg";
import logoTextShortSVG from "../../../images/svg/logoTextShort.svg";
import logoTextLongSVG from "../../../images/svg/logoTextLong.svg";
// import logoCsgoSVG from "../../../images/svg/logoCSGO.svg";
import logoCsgoSVG from "../../../images/svg/csgo-logo.png";

import HeaderCashInfo from "../HeaderCashInfo";

function Navbar(props: navbarProps) {
    const [isRolledUpState, setIsRolledUpState] = useState(true);

    function toTurnNavbar() {
        setIsRolledUpState(!isRolledUpState);
    }

    const navbarElement = (
        <div className={isRolledUpState ? styles.rolledUpNavbar : styles.navbar}>
            <div>
                <h1 className={styles.logo}>
                    <Link to="/" style={{ display: "block" }}>
                        <div className={styles.logoCSGames}>
                            {/* <img src={logoFireSVG} alt="CSGames" /> */}
                            {/* <img src={logoTextSVG} alt="CSGames" className={styles.logoText} /> */}
                            <img src={logoTextSVG} alt="CSGames" />
                        </div>

                        <div className={styles.logoCSGO}>
                            <img src={logoCsgoSVG} alt="CSGO" />
                        </div>
                    </Link>
                </h1>

                <div className={styles.headerCashInfo}>
                    <HeaderCashInfo />
                </div>

                <NavbarList itemOnClick={props.itemOnClick} isRolledUp={isRolledUpState} />
            </div>

            <button type="button" onClick={toTurnNavbar} className={styles.rollUpButton}>
                <div className={styles.customIcon}>{isRolledUpState ? ">" : "<"}</div>
                <span>Свернуть</span>
            </button>
        </div>
    );

    return props.className ? <div className={props.className}>{navbarElement}</div> : navbarElement;
}

type navbarProps = {
    className?: string;
    itemOnClick?: () => void;
};

export default Navbar;
