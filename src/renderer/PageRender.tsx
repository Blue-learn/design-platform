import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
	ActionMap,
	POSITION,
	TemplateSchema,
	WidgetItem,
} from '../types';
import {
	FlashList,
	ListRenderItemInfo,
} from '@shopify/flash-list';
import ItemRenderer from './WidgetRenderer';
import _map from 'lodash-es/map';
import { arePropsEqual } from '../utility';

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
};
const PageRender: React.FC<PageRenderProps> = ({
	template,
}) => {
	const fixedTopWI: WidgetItem[] = [];
	const bodyWI: WidgetItem[] = [];
	const fixedBottomWI: WidgetItem[] = [];
	const absoluteTopWI: WidgetItem[] = [];
	const absoluteBottomWI: WidgetItem[] = [];
	const fabWI: WidgetItem[] = [];

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

	return (
		<>
			{_map(fixedTopWI, _renderItem)}
			<FlashList
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
};

export default memo(
	PageRender,
	arePropsEqual(['template']),
);
