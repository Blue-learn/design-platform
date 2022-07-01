import React, {
	useContext,
	useEffect,
	useState,
} from 'react';
import { ActivityIndicator } from 'react-native';
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

const Navigator: React.FC<
	PageType & ScreenProps
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
		item,
	}: ListRenderItemInfo<WidgetItem>) => {
		return (
			<>
				<ItemRenderer
					item={{
						id: item.id,
						type: item.type,
					}}
					state={state}
				/>
			</>
		);
	};
	const headerFixedTopWidgetItems:
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
	const footerFixedBottomWidgetItems:
		| undefined
		| WidgetItem[] =
		ListOfWidget &&
		ListOfWidget.filter(
			(widgetItem) =>
				widgetItem.position === POSITION.FIXED_BOTTOM,
		);

	return (
		<>
			{headerFixedTopWidgetItems &&
				headerFixedTopWidgetItems.map(
					(widgetItem) => (
						<ItemRenderer
							item={{
								id: widgetItem.id,
								type: widgetItem.type,
							}}
							state={state}
						/>
					),
				)}
			{bodyWidgetItems && (
				<FlashList
					renderItem={_renderItem}
					getItemType={({ type }: WidgetItem) => {
						return type;
					}}
					data={bodyWidgetItems}
					estimatedItemSize={50}
				/>
			)}
			{footerFixedBottomWidgetItems &&
				footerFixedBottomWidgetItems.map(
					(widgetItem) => (
						<ItemRenderer
							item={{
								id: widgetItem.id,
								type: widgetItem.type,
							}}
							state={state}
						/>
					),
				)}
		</>
	);

	// return (
	// 	<View style={{ flex: 1 }}>
	// 		{props.initData && (
	// 			<ListViewRenderer
	// 				id={props.initData.success.data.layout.id}
	// 				datastore={
	// 					props.initData.success.data.datastore
	// 				}
	// 				widgetItems={
	// 					props.initData.success.data.layout.widgets
	// 				}
	// 				actions={props.actions}
	// 			/>
	// 		)}
	// 	</View>
	// );
};

export default Navigator;
