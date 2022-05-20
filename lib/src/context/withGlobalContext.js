"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const index_1 = require("./index");
const withGlobalContext = (WrappedComponent) => {
    return (props) => (react_1.default.createElement(index_1.Context.Consumer, null, (value) => react_1.default.createElement(WrappedComponent, Object.assign({}, props, value))));
};
exports.default = withGlobalContext;
//# sourceMappingURL=withGlobalContext.js.map