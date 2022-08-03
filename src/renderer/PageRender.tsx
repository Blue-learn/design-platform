import {
	FlashList,
	ListRenderItemInfo,
} from '@shopify/flash-list';
import _map from 'lodash-es/map';
import React, { memo } from 'react';
import {
	BackHandler,
	Dimensions,
	StyleSheet,
	View,
} from 'react-native';
import BottomSheet from '../components/BottomSheet';
import SharedPropsService from '../SharedPropsService';
import {
	ActionMap,
	LAYOUTS,
	POSITION,
	TemplateSchema,
	WidgetItem,
} from '../types';
import { arePropsEqual } from '../utility';
import ItemRenderer from './WidgetRenderer';

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
	template: TemplateSchema;
	actions: ActionMap;
	properties?: { style: any };
};

const PageRender: React.FC<PageRenderProps> = ({
	template,
	properties,
}) => {
	const OnScrollRef = React.useRef(null);
	const fixedTopWI: WidgetItem[] = [];
	const bodyWI: WidgetItem[] = [];
	const fixedBottomWI: WidgetItem[] = [];
	const absoluteTopWI: WidgetItem[] = [];
	const absoluteBottomWI: WidgetItem[] = [];
	const fabWI: WidgetItem[] = [];
	const setRef = async (ref: any) => {
		OnScrollRef.current = ref;
		await SharedPropsService.setWidgetRefMap(
			template.layout.id,
			OnScrollRef.current,
		);
	};
	const _layoutMapping = () => {
		template.layout.widgets.map((widgetItem) => {
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
		});
	};

	const _renderItem = ({
		...props
	}: ListRenderItemInfo<WidgetItem>) => {
		return (
			<ItemRenderer
				item={props.item || props}
				datastore={template.datastore}
			/>
		);
	};

	_layoutMapping();

	const _child = (
		<>
			{_map(fixedTopWI, _renderItem)}
			<FlashList
				ref={setRef}
				renderItem={_renderItem}
				data={bodyWI}
				extraData={bodyWI}
				estimatedItemSize={10}
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
	arePropsEqual(['template']),
);
