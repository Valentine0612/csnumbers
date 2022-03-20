import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { initialState, rootReducer } from "./rootReducer";

// REDUX DEV TOOLS
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// END REDUX DEV TOOLS

// const rootReducer = combineReducers(accessTokenReducer);
const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(thunk))
);

export default store;
