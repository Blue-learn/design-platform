import {
	RouteMap,
	WidgetRegistry,
} from './types';

type GlobalProps = {
	widgetRegistry: WidgetRegistry;
	routeMap: RouteMap;
	ref: { [routeId in string]: any };
};

let _globalProps: GlobalProps = {
	widgetRegistry: {},
	routeMap: {},
	ref: {},
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
async function setWidgetRefMap(
	widgetId: string,
	widgetRef: any,
) {
	_globalProps.ref[widgetId] = widgetRef;
}
function getWidgetRef(widgetId: string) {
	return _globalProps.ref[widgetId];
}

export default {
	setGlobalProps,
	getPropsValue,
	setWidgetRefMap,
	getWidgetRef,
};
