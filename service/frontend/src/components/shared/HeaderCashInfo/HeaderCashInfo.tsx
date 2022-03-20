import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTransactionQuery } from "../../../api/transactionsApi";
import { IState } from "../../../store";
import { openPopup } from "../../../store/actionCreators/popupActionCreator";
import { setUserState } from "../../../store/actionCreators/userActionCreator";
import styles from "./HeaderCashInfo.scss";

function HeaderCashInfo() {
    const balanceState = useSelector(
        (state: IState) => state.user.userInfo.balance
    );
    const tokenState = useSelector((state: IState) => state.user.token);

    const dispatch = useDispatch();

    // async function topupBalance() {
    //     const result = await createTransactionQuery(tokenState);

    //     if (result.status === 200) dispatch(setUserState(result.data));
    //     else console.log(result);
    // }

    return balanceState !== null ? (
        <div className={styles.cashInfo}>
            <div className={styles.cashInfoText}>
                <span>{balanceState}</span>
                <div className={styles.moneyChar}>CSCoins</div>
            </div>
            <button
                type="button"
                className={styles.button}
                onClick={() => dispatch(openPopup("topup-balance"))}
            >
                +
            </button>
        </div>
    ) : null;
}

export default HeaderCashInfo;
