import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import Header from "../../shared/Header";
import Popup from "../../popups/Popup";
import GamesView from "../GamesView";
import FAQView from "../FAQView";
import ShopView from "../ShopView";
import styles from "./View.scss";
import animations from "./ViewAnimations.scss";
import AccountView from "../AccountView";
import AdminView from "../AdminView";
import RulesView from "../RulesView";
import ConfidentialityView from "../ConfidentialityView";
import HelpView from "../HelpView";
import { useSelector } from "react-redux";
import { IState } from "../../../store";
import PleaseLogin from "../../shared/PleaseLogin";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import CoinflipsView from "../CoinflipsView";
import NumbersView from "../NumbersView";

function View() {
    const tokenState = useSelector((state: IState) => state.user.token);
    const userState = useSelector((state: IState) => state.user.userInfo);

    const locationState = useLocation();

    const isLogin = (component: () => any) => {
        return tokenState ? component : PleaseLogin;
    };

    const isAdmin = (component: () => any) => {
        return userState.is_staff ? component : NOT_FOUND;
    };

    const NOT_FOUND = () => <div>404 NOT FOUND</div>;

    return (
        <div className={styles.viewAndPopup}>
            <Popup />

            <div className={styles.view}>
                <Header />

                <TransitionGroup>
                    <CSSTransition
                        timeout={300}
                        classNames={{
                            enter: animations.RouteEnter,
                            enterActive: animations.RouteEnterActive,
                            exit: animations.RouteExit,
                            exitActive: animations.RouteExitActive,
                        }}
                        key={locationState.pathname.split("/")[1]}
                    >
                        <Switch location={locationState}>
                            {/* Public Views */}
                            <Route exact path={"/"} component={NumbersView} />
                            <Route
                                exact
                                path={"/coinflip"}
                                component={CoinflipsView}
                            />
                            <Route exact path="/shop" component={ShopView} />
                            <Route exact path="/rules" component={RulesView} />
                            <Route exact path="/faq" component={FAQView} />
                            <Route
                                exact
                                path="/confidentiality"
                                component={ConfidentialityView}
                            />

                            {/* Need to be admin */}
                            <Route
                                path="/console"
                                component={isAdmin(AdminView)}
                            />

                            {/* Need to login */}
                            <Route
                                path="/profile"
                                component={isLogin(AccountView)}
                            />
                            <Route
                                exact
                                path="/help"
                                component={isLogin(HelpView)}
                            />

                            {/* 404 NOT FOUND */}
                            <Route>{NOT_FOUND}</Route>
                        </Switch>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        </div>
    );
}

export default View;
