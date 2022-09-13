import React, { FC, useContext } from 'react';
import {
	Action,
	GlobalActionTokens,
	TemplateSchema,
	WidgetItem,
} from '../types';
import ShimmerRenderer from './ShimmerRenderer';
import _get from 'lodash-es/get';
import SharedPropsService from '../SharedPropsService';
import { Context as GlobalContextConsumer } from '../context';
import { withPerformActionContext } from '../context/PerformActionContext';
import { standardUtilitiesRaw } from '../utility/standartUtility';
import { isEmpty } from 'lodash-es';

type RenderItemProps = {
	item: WidgetItem;
	isLoading?: boolean;
	/** @description render component directly from MicroFrontEnd Page **/
	routeId?: string;
};

const RenderItem: FC<RenderItemProps> = ({
	item,
	isLoading,
	routeId = null,
}) => {
	const {
		state,
		setActions,
		setDataStoreInPath,
		appendWidgets,
	} = useContext(GlobalContextConsumer);
	const standardUtilities = standardUtilitiesRaw(
		state,
		setDataStoreInPath,
		appendWidgets,
	);
	const triggerAction = (action: Action<any>) => {
		switch (action.type) {
			/**
			 * Global Action Handle - Update Datastore for routeId -> widgetId
			 * */
			case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
				if (setDataStoreInPath) {
					setDataStoreInPath(action);
				}
				break;
			}
			/**
			 * Global Action Handle - Set Action map for routeId
			 * */
			case GlobalActionTokens.SET_ACTIONS: {
				if (setActions) {
					setActions(action);
				}
				break;
			}

			default: {
				/**
				 * Custom Action Handle
				 * */
				const template: TemplateSchema =
					action.routeId &&
					state.routeMap &&
					state.routeMap[action.routeId].template;

				const actionsMap =
					template &&
					action.routeId &&
					state.routeMap &&
					state.routeMap[action.routeId].actions;

				if (
					actionsMap != null &&
					template.datastore != null
				) {
					actionsMap[action.type](
						action,
						template?.datastore,
						standardUtilities,
					);
				}
				break;
			}
		}
	};
	if (!item) return <></>;
	if (isLoading)
		return <ShimmerRenderer {...item} />;

	const renderItem = (item: WidgetItem) => {
		const Widget: any = _get(
			SharedPropsService.getPropsValue(
				'widgetRegistry',
			),
			`${item.type}`,
			null,
		);
		if (routeId !== null) {
			item.props = {
				...item.props,
				...(routeId &&
					state.routeMap[routeId].template.datastore[
						item.id
					]),
			};
		}
		if (isEmpty(item.props)) {
			console.warn('[ Render Skipped ] ', item);
			return <></>;
		}
		return (
			<Widget.Component
				key={item.id}
				{...item.props}
				renderItem={renderItem}
				triggerAction={triggerAction}
			/>
		);
	};
	return renderItem(item);
};

export default withPerformActionContext(
	RenderItem,
);
