"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = exports.Context = void 0;
const createDataContext_1 = __importDefault(require("./createDataContext"));
var GlobalActionType;
(function (GlobalActionType) {
    GlobalActionType["SET_CONFIG"] = "set_config";
    GlobalActionType["SET_SCREEN_PROPS"] = "set_screen_props";
})(GlobalActionType || (GlobalActionType = {}));
const initialState = {
    config: null,
    screenProps: null,
};
const GlobalReducer = (state, action) => {
    switch (action.type) {
        case GlobalActionType.SET_CONFIG:
            return { config: action.payload };
        case GlobalActionType.SET_SCREEN_PROPS:
            return { screenProps: action.payload };
        default:
            return state;
    }
};
const setConfig = (dispatch) => {
    return (config) => {
        dispatch({ type: GlobalActionType.SET_CONFIG, payload: config });
    };
};
const setScreenProps = (dispatch) => {
    return (screenProps) => {
        dispatch({
            type: GlobalActionType.SET_SCREEN_PROPS,
            payload: screenProps,
        });
    };
};
_a = (0, createDataContext_1.default)(GlobalReducer, { setConfig, setScreenProps }, initialState), exports.Context = _a.Context, exports.Provider = _a.Provider;
//# sourceMappingURL=GlobalContext.js.map