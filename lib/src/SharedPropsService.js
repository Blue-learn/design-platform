"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _globalProps;
function setGlobalProps(props) {
    _globalProps = props;
}
function getPropsValue(key) {
    if (_globalProps) {
        return _globalProps[key];
    }
    return null;
}
exports.default = {
    setGlobalProps,
    getPropsValue,
};
//# sourceMappingURL=SharedPropsService.js.map