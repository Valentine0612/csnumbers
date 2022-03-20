import React, { useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import AdminOutputs from "../../shared/AdminOutputs/AdminOutputs";
import AdminProducts from "../../shared/AdminProducts";
import AdminUsersList from "../../shared/AdminUsersList";
import styles from "./AdminView.scss";

const windowsList = [
    {
        name: "Товары",
        path: "/",
        component: AdminProducts,
    },
    {
        name: "Пользователи",
        path: "/users",
        component: AdminUsersList,
    },
    {
        name: "Выводы",
        path: "/outputs",
        component: AdminOutputs,
    },
];

const adminPath = "/console";

function AdminView() {
    const locationState = useLocation();
    const history = useHistory();

    const [windowState, setWindowState] = useState(
        locationState.pathname.split("/")[2] || ""
    );

    return (
        <div className={styles.view}>
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
                                history.push(adminPath + elem.path);
                            }}
                        >
                            {elem.name}
                        </button>
                    ))}
                </div>

                <div className={styles.windowBlock}>
                    {/* Show window */}
                    <Switch location={locationState}>
                        {windowsList.map((item, index) => (
                            <Route
                                exact
                                path={adminPath + item.path}
                                component={item.component}
                                key={"account-window__" + index}
                            />
                        ))}
                    </Switch>
                </div>
            </div>
        </div>
    );
}

export default AdminView;
