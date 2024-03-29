import React, {
	memo,
	useContext,
	useEffect,
	useState,
} from 'react';
import { arePropsEqual } from '../utility';
import {
	MicroFrontendProps,
	TemplateSchema,
} from '../types';

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

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '../navigation/root_navigation';
import { standardUtilitiesHook } from '../hook';
import ShimmerRenderer from './ShimmerRenderer';

const MicroFrontend: React.FC<
	MicroFrontendProps
> = ({
	routeMap,
	routeCurrent,
	widgetRegistry,
	extraProps = {},
}) => {
	const [isLoading, toggleLoad] = useState(true);
	const {
		state,
		setRouteMap,
		setTemplateForRoute,
	} = useContext(GlobalContextConsumer);

	const standardUtilities =
		standardUtilitiesHook();

	let template: TemplateSchema | null =
		(state.routeMap != null &&
			state.routeMap[routeCurrent].template) ||
		null;
	let actions =
		(state.routeMap != null &&
			state.routeMap[routeCurrent].actions) ||
		null;
	const buildTemplate = async () => {
		if (routeMap[routeCurrent].template == null) {
			setTemplateForRoute({
				routeId: routeCurrent,
				template: await routeMap[routeCurrent].onLoad(
					standardUtilities,
					extraProps,
				),
			});
		}
	};
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

		await buildTemplate();
		toggleLoad(false);
	};

	useEffect(() => {
		_initGlobalProps();
	}, [routeCurrent, extraProps]);

	const properties: any =
		template?.datastore[routeCurrent];

	if (isLoading) {
		return (
			<>
				{routeMap[routeCurrent].loading?.map(
					(widgetItem) => (
						<View
							style={{
								marginTop: 16,
								marginHorizontal: 16,
							}}
						>
							<ShimmerRenderer {...widgetItem} />
						</View>
					),
				)}
			</>
		);
	}
	return (
		<View
			style={{
				backgroundColor: '#F3F3F3',
				flex: 1,
			}}
		>
			{!isLoading &&
				template != null &&
				actions != null && (
					<PageRender
						loading={
							routeMap[routeCurrent].loading || []
						}
						template={template}
						actions={actions}
						properties={properties}
						onEndReached={
							routeMap[routeCurrent].onEndReached
						}
						onRefresh={_initGlobalProps}
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

const Stack = createNativeStackNavigator();
const MicroFrontendWithNavigation: React.FC<
	MicroFrontendProps
> = (props) => {
	return (
		<NavigationContainer
			independent
			ref={navigationRef}
		>
			{/* @ts-ignore */}
			<Stack.Navigator
				screenOptions={{ headerShown: false }}
				initialRouteName={props.routeCurrent}
			>
				{Object.keys(props.routeMap).map(
					(routeId) => {
						const renderMF = () =>
							React.useMemo(
								() => (
									<MicroFrontend
										{...props}
										routeCurrent={routeId}
									/>
								),
								[routeId, props],
							);

						return (
							<Stack.Screen
								name={routeId}
								key={routeId}
								options={{
									presentation: 'transparentModal',
								}}
							>
								{renderMF}
							</Stack.Screen>
						);
					},
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

const MicroFrontendWithContext: React.FC<
	MicroFrontendProps
> = (props) => {
	return (
		<GlobalContextProvider>
			<MicroFrontendWithNavigation {...props} />
		</GlobalContextProvider>
	);
};
export default memo(
	MicroFrontendWithContext,
	arePropsEqual([
		'routeCurrent',
		'routeMap',
		'extraProps',
	]),
);
