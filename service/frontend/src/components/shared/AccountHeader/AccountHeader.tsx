import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import ViewHeaderStatsItem from "../ViewHeaderStatsItem";
import styles from "./AccountHeader.scss";

function AccountHeader() {
    const usernameState = useSelector(
        (state: IState) => state.user.userInfo.username
    );
    const balanceState = useSelector(
        (state: IState) => state.user.userInfo.balance
    );
    const avatarState = useSelector(
        (state: IState) =>
            state.user.userInfo.avatar_url || state.user.userInfo.avatar
    );

    const dispatch = useDispatch();

    return (
        <div className={styles.header}>
            <div className={styles.avatarPart}>
                <div className={styles.avatarWrapper}>
                    <img
                        src={avatarState}
                        alt={usernameState}
                        className={styles.avatar}
                    />
                </div>

                <div className={styles.usernameBlock}>{usernameState}</div>

                {/* <Link
                    to={location.pathname + "?popup=correct-account"}
                    className={styles.correctProfileButton}
                >
                    Редактировать профиль
                </Link> */}
            </div>

            <div className={styles.infoPart}>
                <div className={styles.stats}>
                    <div className={styles.statsItem}>
                        <ViewHeaderStatsItem count={13} text={"мои игры"} />
                    </div>
                    <div className={styles.statsItem}>
                        <ViewHeaderStatsItem
                            count={balanceState}
                            text={"моя сумма"}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.pullBalansButton}
                    onClick={() => {
                        dispatch(openPopup("output"));
                    }}
                >
                    Запрос на вывод
                </button>
            </div>
        </div>
    );
}

export default AccountHeader;
