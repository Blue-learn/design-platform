import _map from 'lodash-es/map';
import React, {
	memo,
	useCallback,
	useContext,
	useRef,
} from 'react';
import {
	Dimensions,
	FlatList,
	KeyboardAvoidingView,
	ListRenderItemInfo,
	RefreshControl,
	StyleSheet,
	View,
} from 'react-native';
import BottomSheet from '../components/BottomSheet';
import SharedPropsService from '../SharedPropsService';
import {
	ActionMap,
	LAYOUTS,
	POSITION,
	StandardUtilities,
	TemplateSchema,
	WidgetItem,
} from '../types';
import { arePropsEqual } from '../utility';
import RenderItem from './RenderItem';
import { standardUtilitiesRaw } from '../utility/standartUtility';
import { Context as GlobalContextConsumer } from '../context';

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

type PageRenderProps = {
	loading: WidgetItem[];
	template: TemplateSchema;
	actions: ActionMap;
	properties?: { style: any };
	onEndReached?: (
		standardUtilities: StandardUtilities,
	) => void;
	onRefresh?: () => void;
	routeId: string;
};

const PageRender: React.FC<PageRenderProps> = ({
	loading = [],
	template,
	properties,
	onEndReached,
	onRefresh = () => {},
	routeId,
}) => {
	const {
		state,
		setDataStoreInPath,
		appendWidgets,
	} = useContext(GlobalContextConsumer);

	const [isFetching, setIsFetching] =
		React.useState(false);
	const OnScrollRef = React.useRef(null);
	const fixedTopWI: WidgetItem[] = [];
	const bodyWI: WidgetItem[] = [];
	const fixedBottomWI: WidgetItem[] = [];
	const absoluteTopWI: WidgetItem[] = [];
	const absoluteBottomWI: WidgetItem[] = [];
	const fabWI: WidgetItem[] = [];
	const renderedWidgetsArray: string[] = [];
	const callOnScrollEnd = useRef(false);
	const standardUtilities = standardUtilitiesRaw(
		state,
		setDataStoreInPath,
		appendWidgets,
	);

	const EnableOnEndReach = () =>
		(callOnScrollEnd.current = true);

	const onScroll = useCallback(() => {
		if (callOnScrollEnd.current) {
			if (!onEndReached) return;
			onEndReached(standardUtilities);
			callOnScrollEnd.current = false;
		}
	}, []);

	const setRef = async (ref: any) => {
		OnScrollRef.current = ref;
		await SharedPropsService.setWidgetRefMap(
			template.layout.id,
			OnScrollRef.current,
		);
	};

	const _layoutMapping = () => {
		console.log(
			'template in layout mapping',
			template.layout.widgets,
		);

		template.layout.widgets.map((widgetItem) => {
			if (
				!renderedWidgetsArray.includes(widgetItem.id)
			) {
				renderedWidgetsArray.push(widgetItem.id);
				switch (widgetItem.position) {
					case POSITION.FIXED_TOP: {
						fixedTopWI.push(widgetItem);
						break;
					}
					case POSITION.FIXED_BOTTOM: {
						fixedBottomWI.push(widgetItem);
						break;
					}
					case POSITION.ABSOLUTE_TOP: {
						absoluteTopWI.push(widgetItem);
						break;
					}
					case POSITION.ABSOLUTE_BOTTOM: {
						absoluteBottomWI.push(widgetItem);
						break;
					}
					case POSITION.FAB: {
						fabWI.push(widgetItem);
						break;
					}
					default: {
						bodyWI.push(widgetItem);
						break;
					}
				}
			}
		});
	};

	const _renderListItem = ({
		item,
	}: ListRenderItemInfo<WidgetItem>) => {
		return (
			<RenderItem
				item={item}
				routeId={routeId}
				isLoading={isFetching}
			/>
		);
	};

	const _renderItem = (item: WidgetItem) => {
		return (
			<RenderItem
				item={item}
				routeId={routeId}
				isLoading={isFetching}
			/>
		);
	};

	_layoutMapping();

	const _child = (
		<>
			{_map(fixedTopWI, _renderItem)}
			<FlatList
				ref={setRef}
				renderItem={_renderListItem}
				data={bodyWI}
				extraData={bodyWI}
				onEndReachedThreshold={0.5}
				showsHorizontalScrollIndicator={false}
				keyboardDismissMode='none'
				onEndReached={EnableOnEndReach}
				onMomentumScrollEnd={onScroll}
				refreshControl={
					<RefreshControl
						refreshing={isFetching}
						onRefresh={onRefresh}
					/>
				}
			/>
			{_map(fixedBottomWI, _renderItem)}
			<View style={styles.absoluteTop}>
				{_map(absoluteTopWI, _renderItem)}
			</View>
			<View style={styles.fab}>
				{_map(fabWI, _renderItem)}
			</View>
			<View style={styles.absoluteBottom}>
				{_map(absoluteBottomWI, _renderItem)}
			</View>
		</>
	);

	if (template.layout.type === LAYOUTS.MODAL) {
		return (
			<BottomSheet
				height={Dimensions.get('screen').height * 0.6}
				hasDraggableIcon={true}
				sheetBackgroundColor={
					properties?.style?.backgroundColor
				}
			>
				{_child}
			</BottomSheet>
		);
	} else {
		return _child;
	}
};

export default memo(
	PageRender,
	arePropsEqual(['template', 'actions']),
);
