import React, {
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	View,
} from 'react-native';
import SharedPropsService from '../SharedPropsService';
import {
	PageType,
	POSITION,
	ScreenProps,
	WidgetItem,
} from '../types';
import { Context as GlobalContext } from '../context';
import {
	FlashList,
	ListRenderItemInfo,
} from '@shopify/flash-list';
import ItemRenderer from '../render/ItemRenderer';
import _map from 'lodash-es/map';

const styles = StyleSheet.create({
	absoluteTop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
	},
	absoluteBottom: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	fab: {
		position: 'absolute',
		bottom: 16,
		left: 0,
		right: 0,
	},
});

const Navigator: React.FC<
	PageType<any> & ScreenProps
> = (props) => {
	const [isLoading, toggleLoad] = useState(true);
	const {
		state,
		setConfig,
		setScreenProps,
		setDatastore,
		setActions,
	} = useContext(GlobalContext);

	const _initGlobalProps = async () => {
		toggleLoad(true);
		await SharedPropsService.setGlobalProps(props);

		if (Object.values(state.actions).length === 0) {
			setActions(props.actions);
		}
		if (state.config == null) {
			setConfig(props.widgetRegistry);
		}
		if (state.screenProps == null) {
			setScreenProps(props);
		}
		if (state.datastore == null) {
			setDatastore(
				props.initData?.success.data.datastore,
			);
		}

		toggleLoad(false);
	};

	useEffect(() => {
		_initGlobalProps();
	}, []);

	if (isLoading)
		return (
			<ActivityIndicator
				style={{ margin: 10 }}
				size='large'
				color={'black'}
			/>
		);
	const ListOfWidget: WidgetItem[] =
		props.initData &&
		props.initData?.success.data.layout.widgets
			.length > 0
			? props.initData.success.data.layout.widgets
			: [];
	const _renderItem = ({
		...props
	}: ListRenderItemInfo<WidgetItem>) => {
		return (
			<ItemRenderer
				item={props.item || props}
				state={state}
			/>
		);
	};

	const fixedTopWidgetItems:
		| undefined
		| WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position === POSITION.FIXED_TOP,
		);
	const bodyWidgetItems: undefined | WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position == undefined,
		);
	const fixedBottomWidgetItems:
		| undefined
		| WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position === POSITION.FIXED_BOTTOM,
		);

	const absoluteTopWidgetItems:
		| undefined
		| WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position === POSITION.ABSOLUTE_TOP,
		);
	const absoluteBottomWidgetItems:
		| undefined
		| WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position ===
				POSITION.ABSOLUTE_BOTTOM,
		);
	const fabWidgetItems: undefined | WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position === POSITION.FAB,
		);

	return (
		<>
			{_map(fixedTopWidgetItems, _renderItem)}
			{bodyWidgetItems && (
				<FlashList
					renderItem={_renderItem}
					data={bodyWidgetItems}
					extraData={bodyWidgetItems}
					estimatedItemSize={10}
				/>
			)}
			{_map(fixedBottomWidgetItems, _renderItem)}
			<View style={styles.absoluteTop}>
				{_map(absoluteTopWidgetItems, _renderItem)}
			</View>
			<View style={styles.fab}>
				{_map(fabWidgetItems, _renderItem)}
			</View>
			<View style={styles.absoluteBottom}>
				{_map(absoluteBottomWidgetItems, _renderItem)}
			</View>
		</>
	);
};

export default Navigator;
