"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const get_1 = __importDefault(require("lodash-es/get"));
const ItemRenderer_1 = __importDefault(require("./ItemRenderer"));
const SharedPropsService_1 = __importDefault(require("../SharedPropsService"));
class StandardWidgetRenderer extends react_1.default.PureComponent {
    constructor(props) {
        super(props);
        this.renderItem = (item, extraProps = { isVisible: false }) => {
            return (react_1.default.createElement(ItemRenderer_1.default, { item: Object.assign({}, item), extraProps: Object.assign({}, extraProps) }));
        };
        this.state = {
            isVisible: props.isVisible || false,
        };
        if (StandardWidgetRenderer.config === null) {
            StandardWidgetRenderer.config =
                SharedPropsService_1.default.getPropsValue("vdlConfig");
        }
        this.widgetRef = react_1.default.createRef();
    }
    componentDidMount() { }
    componentWillUnmount() { }
    static getDerivedStateFromProps(props, state) {
        return null;
    }
    render() {
        const _a = this.props, { item, performAction, showModalSheet } = _a, restProps = __rest(_a, ["item", "performAction", "showModalSheet"]);
        let itemProps = restProps;
        if (item.props) {
            const newItemProps = item.props;
            itemProps = Object.assign(Object.assign({}, itemProps), newItemProps);
        }
        const props = Object.assign(Object.assign({}, itemProps), { renderItem: this.renderItem, performAction,
            showModalSheet, isVisible: true });
        const Widget = (0, get_1.default)(StandardWidgetRenderer.config, `${item.type || item.widgetType}`, null);
        const WidgetToRender = Widget.Component;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(WidgetToRender, Object.assign({}, props, { ref: this.widgetRef }))));
    }
}
StandardWidgetRenderer.config = null;
exports.default = StandardWidgetRenderer;
//# sourceMappingURL=StandardWidgetRenderer.js.map