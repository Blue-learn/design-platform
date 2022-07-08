import React from 'react';
import { Dimensions, View } from 'react-native';
import {
	RecyclerListView,
	DataProvider,
	LayoutProvider,
} from 'recyclerlistview';
import ItemRenderer from '../render/ItemRenderer';
import _get from 'lodash-es/get';
import { WidgetItem } from '../types';
import { ComponentHeightCalculate } from './ComponentHeightCalculate';
import { GlobalState } from '../context';

const { width } = Dimensions.get('window');
const heightsMapRef = { current: {} };

/** Example usage
 * {
	<RecyclerList
		id={props.initData.success.data.layout.id}
		datastore={
			props.initData.success.data.datastore
		}
		widgetItems={
			props.initData.success.data.layout.widgets
		}
		actions={props.actions}
	/>;
}*/

class RecyclerList extends React.Component<
	{
		id: string;
		widgetItems: WidgetItem[];
	} & GlobalState,
	{
		dataProvider: DataProvider;
		layoutStyle?: object;
		isMeasuring: boolean;
	}
> {
	private _layoutProvider: LayoutProvider;
	constructor(args: any) {
		super(args);

		let dataProvider = new DataProvider(
			(r1, r2) => {
				return r1 !== r2;
			},
		);

		this._rowRenderer =
			this._rowRenderer.bind(this);
		this.state = {
			dataProvider: dataProvider.cloneWithRows(
				this.props.widgetItems,
			),
			layoutStyle: _get(
				this.props.datastore,
				this.props.id,
			),
			isMeasuring: true,
		};
	}
	initLayoutMaker = () => {
		this._layoutProvider = new LayoutProvider(
			(index) => {
				return index;
			},
			(type, dim, index) => {
				const item =
					this.state.dataProvider.getAllData()[index];
				dim.width = width;
				dim.height =
					heightsMapRef.current[item.id] | 0;
			},
		);
	};

	_rowRenderer(type: number, data: WidgetItem) {
		return (
			<ItemRenderer
				item={{
					id: data.id,
					type: data.type,
					props: {
						...data?.props,
						...(this.props.datastore &&
							this.props.datastore[data.id]),
					},
				}}
			/>
		);
	}
	_updateHeight = (calculatedHeights: {
		[key in string | number]: number;
	}) => {
		heightsMapRef.current = calculatedHeights;
		this.setState({ isMeasuring: false });
		this.initLayoutMaker();
	};
	render() {
		if (this.state.isMeasuring)
			return (
				<ComponentHeightCalculate
					widgetItems={this.state.dataProvider.getAllData()}
					datastore={this.props.datastore}
					callback={this._updateHeight}
				/>
			);
		return (
			<>
				<View
					style={[
						{ height: 60, backgroundColor: 'red' },
						this.state.layoutStyle,
					]}
				></View>
				<RecyclerListView
					layoutProvider={this._layoutProvider}
					dataProvider={this.state.dataProvider}
					rowRenderer={this._rowRenderer}
				/>
				<View
					style={{
						height: 60,
						backgroundColor: 'red',
					}}
				></View>
			</>
		);
	}
}
export default RecyclerList;
