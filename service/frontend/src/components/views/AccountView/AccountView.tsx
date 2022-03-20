import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Route, Switch, useHistory, useLocation } from "react-router";
import { IState } from "../../../store";
import AccountHeader from "../../shared/AccountHeader";
import AccountHistory from "../../shared/AccountHistory";
import AccountInventory from "../../shared/AccountInventory";
import AccountOutputs from "../../shared/AccountOutputs";
import AccountProfile from "../../shared/AccountProfile";
import PleaseLogin from "../../shared/PleaseLogin";
import styles from "./AccountView.scss";

const windowsList = [
    {
        name: "Профиль",
        path: "/",
        component: AccountProfile,
    },
    {
        name: "Инвентарь",
        path: "/inventory",
        component: AccountInventory,
    },
    {
        name: "Финансы",
        path: "/transactions",
        component: AccountHistory,
    },
    {
        name: "Выводы",
        path: "/outputs",
        component: AccountOutputs,
    },
];

const profilePath = "/profile";

function AccountView() {
    const locationState = useLocation();
    const history = useHistory();

    const [windowState, setWindowState] = useState(
        // locationState.pathname.replace(/\//g, "")
        locationState.pathname.split("/")[2] || ""
    );

    const tokenState = useSelector((state: IState) => state.user.token);

    return tokenState ? (
        <div className={styles.view}>
            <AccountHeader />

            <div className={styles.mainWindow}>
                {/* Show navigation */}
                <div className={styles.navigationBlock}>
                    {windowsList.map((elem, index) => (
                        <button
                            key={"account__navigation__" + index}
                            className={
                                elem.path === "/" + windowState
                                    ? styles.navigationItemSelected
                                    : styles.navigationItem
                            }
                            onClick={() => {
                                setWindowState(elem.path.replace(/\//g, ""));
                                history.push(profilePath + elem.path);
                            }}
                        >
                            {elem.name}
                        </button>
                    ))}
                </div>

                <div className={styles.windowBlock}>
                    <Switch location={locationState}>
                        {windowsList.map((item, index) => (
                            <Route
                                exact
                                path={profilePath + item.path}
                                component={item.component}
                                key={"account-window__" + index}
                            />
                        ))}
                    </Switch>
                </div>
            </div>
        </div>
    ) : (
        <div className={styles.view}>
            <PleaseLogin />
        </div>
    );
}

export default AccountView;
