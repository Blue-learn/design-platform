import React from 'react';
import _get from 'lodash-es/get';
import { View, Text } from 'react-native';
import ItemRenderer from './WidgetRenderer';
import { Datastore, WidgetProps } from '../types';
import SharedPropsService from '../SharedPropsService';

class Renderer extends React.PureComponent<
	WidgetProps & { datastore: Datastore }
> {
	widgetRef: React.RefObject<View>;

	constructor(props: any) {
		super(props);
		this.state = {
			isVisible: true,
		};
		this.widgetRef = React.createRef<View>();
	}

	renderItem = (
		item: WidgetProps,
		extraProps: any = { isVisible: false },
	) => {
		return (
			<ItemRenderer
				item={{
					...item,
				}}
				extraProps={...{
					...extraProps,
				}}
			/>
		);
	};

	render() {
		const { item, triggerAction, ...restProps } =
			this.props;

		let itemProps: any = restProps;

		if (item.props) {
			if (this.props?.datastore) {
				itemProps = {
					...item.props,
					...this.props.datastore[item.id],
				};
			} else {
				itemProps = item.props;
			}
		}

		const props: any = {
			...itemProps,
			renderItem: this.renderItem,
			triggerAction: triggerAction,
			isVisible: true,
		};

		const Widget: any = _get(
			SharedPropsService.getPropsValue(
				'widgetRegistry',
			),
			`${item.type}`,
			null,
		);

		if (!Widget || !Widget.Component)
			return (
				<Text key={item.id}>
					Error type:{item.type} id:{item.id} not found
				</Text>
			);

		const WidgetToRender = Widget.Component;

		return (
			<WidgetToRender
				key={item.id}
				{...props}
				// ref={this.widgetRef}
			/>
		);
	}
}

export default Renderer;
