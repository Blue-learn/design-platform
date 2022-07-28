import React, {
	memo,
	useContext,
	useEffect,
	useState,
} from 'react';
import { arePropsEqual } from '../utility';
import { MicroFrontendProps } from '../types';

import {
	Provider as GlobalContextProvider,
	Context as GlobalContextConsumer,
} from '../context';
import {
	ActivityIndicator,
	View,
} from 'react-native';
import SharedPropsService from '../SharedPropsService';
import PageRender from './PageRender';

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
	} = useContext(GlobalContextConsumer);
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
			ref: {},
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

const MicroFrontendWithContext: React.FC<
	MicroFrontendProps
> = (props) => {
	return (
		<GlobalContextProvider>
			<MicroFrontend {...props} />
		</GlobalContextProvider>
	);
};

export default memo(
	MicroFrontendWithContext,
	arePropsEqual(['routeCurrent']),
);
