"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPerformActionContext = void 0;
const react_1 = __importDefault(require("react"));
const PerformActionContext = react_1.default.createContext(() => () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }));
const withPerformActionContext = (WrappedComponent) => {
    return react_1.default.forwardRef((props, ref) => (react_1.default.createElement(PerformActionContext.Consumer, null, (value) => (react_1.default.createElement(WrappedComponent, Object.assign({}, props, { ref: ref, performTapAction: value }))))));
};
exports.withPerformActionContext = withPerformActionContext;
exports.default = PerformActionContext;
//# sourceMappingURL=PerformActionContext.js.map