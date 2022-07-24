import React from 'react';
import _get from 'lodash-es/get';
import SharedPropsService from '../SharedPropsService';
import { WidgetItem } from '../types';

const ShimmerRenderer: React.FunctionComponent<
	WidgetItem
> = ({ type }) => {
	const widgetRegistry =
		SharedPropsService.getPropsValue(
			'widgetRegistry',
		);

	const Widget = _get(
		widgetRegistry,
		`${type}`,
		null,
	);

	const WidgetToRender =
		Widget && Widget.Shimmer
			? Widget.Shimmer
			: null;

	return (
		<>
			{WidgetToRender ? <WidgetToRender /> : null}
		</>
	);
};
export default ShimmerRenderer;
