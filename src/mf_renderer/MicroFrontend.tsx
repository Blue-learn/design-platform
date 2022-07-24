import React, {
	memo,
	useContext,
	useEffect,
	useState,
} from 'react';
import { arePropsEqual } from '../utility';
import { MicroFrontendProps } from '../types';
import { Context as GlobalContext } from '../context';
import {
	ActivityIndicator,
	View,
} from 'react-native';
import SharedPropsService from '../SharedPropsService';
import { PageRender } from '../page_render';

const MicroFrontend: React.FC<
	MicroFrontendProps
> = ({
	routeMap,
	routeCurrent,
	widgetRegistry,
}) => {
	const [isLoading, toggleLoad] = useState(true);
	const {
		state,
		setRouteMap,
		setTemplateForRoute,
	} = useContext(GlobalContext);
	let template =
		(state.routeMap != null &&
			state.routeMap[routeCurrent].template) ||
		null;
	let actions =
		(state.routeMap != null &&
			state.routeMap[routeCurrent].actions) ||
		null;

	const _initGlobalProps = async () => {
		toggleLoad(true);
		await SharedPropsService.setGlobalProps({
			widgetRegistry: widgetRegistry,
			routeMap: routeMap,
		});
		if (state.routeMap == null) {
			await setRouteMap(routeMap);
		}

		if (routeMap[routeCurrent].template == null) {
			setTemplateForRoute({
				routeId: routeCurrent,
				template: await routeMap[
					routeCurrent
				].onLoad(),
			});
		}
		toggleLoad(false);
	};

	useEffect(() => {
		_initGlobalProps();
	}, [routeCurrent]);

	return (
		<View
			style={{ backgroundColor: 'white', flex: 1 }}
		>
			{!isLoading &&
				template != null &&
				actions != null && (
					<PageRender
						template={template}
						actions={actions}
					/>
				)}
			{isLoading && (
				<ActivityIndicator
					size={'large'}
					color={'green'}
				/>
			)}
		</View>
	);
};

export default memo(
	MicroFrontend,
	arePropsEqual(['routeCurrent']),
);
