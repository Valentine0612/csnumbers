import React from "react";
import styles from "./ViewHeaderStatsItem.scss";

function ViewHeaderStatsItem(props: ViewHeaderStatsItemProps) {
    return (
        <div className={styles.item}>
            <span className={styles.count}>{props.count}</span>
            {props.text}
        </div>
    );
}

type ViewHeaderStatsItemProps = {
    count: string | number;
    text: string | number;
};

export default ViewHeaderStatsItem;
