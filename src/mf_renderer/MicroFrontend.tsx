import React, {
	memo,
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	arePropsEqual,
	EmptyTemplate,
} from '../utility';
import { MicroFrontendProps } from '../types';
import { Context as GlobalContext } from '../context';
import { ActivityIndicator } from 'react-native';
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
		setActions,
		setRouteMap,
		setTemplateForRoute,
	} = useContext(GlobalContext);

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
			await setTemplateForRoute({
				routeId: routeCurrent,
				template: routeMap[routeCurrent].onLoad(),
			});
		}
		if (routeMap[routeCurrent].actions == null) {
			await setActions({
				routeId: routeCurrent,
				actions: routeMap[routeCurrent].actions,
			});
		}

		toggleLoad(false);
	};

	useEffect(() => {
		_initGlobalProps();
	}, [routeCurrent]);

	return (
		<>
			{!isLoading && state.routeMap && (
				<PageRender
					template={
						state.routeMap[routeCurrent].template ||
						EmptyTemplate
					}
					actions={
						state.routeMap[routeCurrent].actions || {}
					}
				/>
			)}
			{isLoading && (
				<ActivityIndicator size={'large'} />
			)}
		</>
	);
};

export default memo(
	MicroFrontend,
	arePropsEqual(['routeCurrent']),
);
