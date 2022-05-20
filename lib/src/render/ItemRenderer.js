"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const isEmpty_1 = __importDefault(require("lodash-es/isEmpty"));
const PerformActionContext_1 = require("../context/PerformActionContext");
const StandardWidgetRenderer_1 = __importDefault(require("./StandardWidgetRenderer"));
class ItemRenderer extends react_1.default.PureComponent {
    constructor(props) {
        super(props);
        const { item, performTapAction } = props;
        this.boundPerformTapAction = performTapAction();
    }
    componentDidMount() {
        const { item, onComponentMount } = this.props;
        if (onComponentMount &&
            !(0, isEmpty_1.default)(item) &&
            (!(0, isEmpty_1.default)(item.props) || !(0, isEmpty_1.default)(this.itemData)))
            onComponentMount(item.id || "");
    }
    render() {
        const { item, extraProps = {}, forwardedRef, isShimmer } = this.props;
        const itemData = item.props || {};
        if (itemData !== this.itemData) {
            this.itemData = itemData;
        }
        if ((0, isEmpty_1.default)(item.props) && (0, isEmpty_1.default)(itemData)) {
            const errorObj = {
                errorType: "ERROR_TYPES.ITEM_RENDERING_SKIPPED",
                message: `Component ${item.type} not rendered. Missing props for id ${item.id}.`,
            };
            console.warn(errorObj);
            return null;
        }
        return (react_1.default.createElement(StandardWidgetRenderer_1.default, Object.assign({ key: `${item.id || item.type}`, ref: forwardedRef, performAction: this.boundPerformTapAction, item: item }, extraProps, itemData)));
    }
}
const ItemRendererWithRef = react_1.default.forwardRef((props, ref) => {
    return react_1.default.createElement(ItemRenderer, Object.assign({}, props, { forwardedRef: ref }));
});
exports.default = (0, PerformActionContext_1.withPerformActionContext)(ItemRendererWithRef);
//# sourceMappingURL=ItemRenderer.js.map