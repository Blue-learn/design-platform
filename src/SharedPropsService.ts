import {
	RouteMap,
	WidgetRegistry,
} from './types';

type GlobalProps = {
	widgetRegistry: WidgetRegistry;
	routeMap: RouteMap;
};

let _globalProps: GlobalProps = {
	widgetRegistry: {},
	routeMap: {},
};

async function setGlobalProps(
	props: GlobalProps,
) {
	_globalProps = await props;
}

function getPropsValue(key?: string) {
	if (_globalProps && key) {
		return _globalProps[key];
	}
	return null;
}

export default {
	setGlobalProps,
	getPropsValue,
};
