"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const get_1 = __importDefault(require("lodash-es/get"));
// import Separator from './components/Separator';
const ShimmerWidgetRenderer = ({ type, }) => {
    // const config = SharedPropsService.getPropsValue('config');
    const Widget = (0, get_1.default)({} /*config*/, `${type}`, null);
    const WidgetToRender = Widget ? Widget.Shimmer : null;
    return react_1.default.createElement(react_1.default.Fragment, null, WidgetToRender ? react_1.default.createElement(WidgetToRender, null) : null);
};
exports.default = ShimmerWidgetRenderer;
//# sourceMappingURL=ShimmerWidgetRenderer.js.map