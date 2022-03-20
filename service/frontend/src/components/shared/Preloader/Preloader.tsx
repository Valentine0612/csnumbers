import React from "react";
import styles from "./Preloader.scss";

function Preloader(props: PreloaderProps) {
    return (
        <div className={props.inline ? styles.inlineLdsRing : styles.ldsRing}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}

type PreloaderProps = {
    inline?: boolean;
};

export default Preloader;
