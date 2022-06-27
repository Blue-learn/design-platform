import React from 'react';
import _isEmpty from 'lodash-es/isEmpty';
import {
	PerformActionFn,
	PerformTapActionFn,
	withPerformActionContext,
} from '../context/PerformActionContext';
import StandardWidgetRenderer from './StandardWidgetRenderer';
import ShimmerWidgetRenderer from './ShimmerWidgetRenderer';
import { WidgetItem } from '../types';
import withGlobalContext from '../context/withGlobalContext';
import { GlobalState } from '../context';

interface Props {
	item: WidgetItem;
	extraProps?: any;
	isShimmer?: boolean;
	onComponentMount?: (id: string) => void;
	forwardedRef?: any;
	//from withPerformActionContext
	performTapAction?: PerformTapActionFn;
	//from withGlobalContext
	state: GlobalState;
}

class ItemRenderer extends React.PureComponent<Props> {
	boundPerformTapAction: PerformActionFn;

	itemData: any;

	constructor(props: Props) {
		super(props);
		// const { performTapAction } = props;
		// if (performTapAction) {
		// 	this.boundPerformTapAction =
		// 		performTapAction();
		// }
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
			state,
		} = this.props;

		const itemData =
			item.props ||
			(state &&
				state.datastore &&
				state.datastore[item.id]);

		if (itemData !== this.itemData) {
			this.itemData = itemData;
		}

		if (
			_isEmpty(item.props) &&
			_isEmpty(itemData)
		) {
			const errorObj = {
				errorType:
					'ERROR_TYPES.ITEM_RENDERING_SKIPPED',
				message: `Component ${item.type} not rendered. Missing props for id ${item.id}.`,
			};
			console.warn('Error ItemRender->', errorObj);
			return null;
		}

		if (isShimmer)
			return <ShimmerWidgetRenderer {...item} />;

		return (
			<StandardWidgetRenderer
				key={`${item.id || item.type}`}
				ref={forwardedRef}
				performAction={this.props.performTapAction}
				item={item}
				datastore={this.props.state.datastore}
				{...extraProps}
				{...itemData}
			/>
		);
	}
}

const ItemRendererWithRef = React.forwardRef(
	(props: Props, ref) => {
		return (
			<ItemRenderer {...props} forwardedRef={ref} />
		);
	},
);

export default withGlobalContext(
	withPerformActionContext(ItemRendererWithRef),
);
