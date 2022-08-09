import React, {
	memo,
	useContext,
	useEffect,
	useState,
} from 'react';
import { arePropsEqual } from '../utility';
import {
	LAYOUTS,
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
				template: await routeMap[routeCurrent].onLoad(
					standardUtilities,
				),
			});
		}
		toggleLoad(false);
	};

	useEffect(() => {
		_initGlobalProps();
	}, [routeCurrent]);

	const properties: any =
		template?.datastore[routeCurrent];

	return (
		<View
			style={{
				backgroundColor: 'transparent',
				flex: 1,
			}}
		>
			{!isLoading &&
				template != null &&
				actions != null && (
					<PageRender
						template={template}
						actions={actions}
						properties={properties}
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
								[routeId],
							);

						return (
							<Stack.Screen
								name={routeId}
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
	arePropsEqual(['routeCurrent']),
);
