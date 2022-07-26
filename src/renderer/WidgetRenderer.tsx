import React from 'react';
import _isEmpty from 'lodash-es/isEmpty';
import { withPerformActionContext } from '../context/PerformActionContext';
import Renderer from './Renderer';
import {
	Datastore,
	TriggerAction,
	WidgetItem,
} from '../types';
import withGlobalContext from '../context/withGlobalContext';
import ShimmerRenderer from './ShimmerRenderer';

interface Props {
	item: WidgetItem;
	extraProps?: any;
	isShimmer?: boolean;
	onComponentMount?: (id: string) => void;
	forwardedRef?: any;
	/** from withPerformActionContext **/
	triggerAction?: TriggerAction;
	/** from withGlobalContext **/
	datastore: Datastore;
}

class WidgetRenderer extends React.PureComponent<Props> {
	itemData: any;

	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		const { item, onComponentMount } = this.props;

		if (
			onComponentMount &&
			!_isEmpty(item) &&
			(!_isEmpty(item.props) ||
				!_isEmpty(this.itemData))
		)
			onComponentMount(item.id || '');
	}

	render() {
		const {
			item,
			extraProps = {},
			forwardedRef,
			isShimmer,
			datastore,
		} = this.props;

		const itemData =
			item.props ||
			(datastore && datastore[item.id]);

		if (itemData !== this.itemData) {
			this.itemData = itemData;
		}

		if (
			_isEmpty(item.props) &&
			_isEmpty(itemData)
		) {
			const errorObj = {
				errorType: 'ERROR: WIDGET RENDER SKIPPED',
				message: `type-> ${item.type} id-> ${item.id} props-> ${item.props}.`,
			};
			console.warn(
				errorObj.errorType,
				errorObj.message,
			);
			return null;
		}

		if (isShimmer)
			return <ShimmerRenderer {...item} />;

		return (
			<Renderer
				key={`${item.id || item.type}`}
				ref={forwardedRef}
				triggerAction={this.props.triggerAction}
				item={item}
				datastore={datastore}
				{...extraProps}
				{...itemData}
			/>
		);
	}
}

const WidgetRendererWithRef = React.forwardRef(
	(props: Props, ref) => {
		return (
			<WidgetRenderer
				{...props}
				forwardedRef={ref}
			/>
		);
	},
);

export default withGlobalContext(
	withPerformActionContext(WidgetRendererWithRef),
);
