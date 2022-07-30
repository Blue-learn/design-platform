import React, { Component } from 'react';
import {
	View,
	Modal,
	TouchableOpacity,
	Animated,
	PanResponder,
	StyleSheet,
	StyleProp,
	ViewStyle,
	PanResponderInstance,
	NativeEventSubscription,
	BackHandler,
} from 'react-native';
import { goBack } from '../../navigation/root_navigation';

export interface BottomSheetProps {
	height: number;
	closeFunction?: () => void;
	hasDraggableIcon?: boolean;
	backgroundColor?: string;
	sheetBackgroundColor?: string;
	dragIconColor?: string;
	dragIconStyle?: StyleProp<ViewStyle>;
	draggable?: boolean;
	onRequestClose?: () => void;
	onClose?: () => void;
	radius?: number;
}
export interface BottomSheetState {
	modalVisible: boolean;
	animatedHeight: Animated.Value;
	pan: Animated.ValueXY;
}

let panResponder: PanResponderInstance;

class BottomSheet extends Component<
	BottomSheetProps,
	BottomSheetState
> {
	private backHandler: NativeEventSubscription;
	constructor(props: BottomSheetProps) {
		super(props);
		this.state = {
			modalVisible: false,
			animatedHeight: new Animated.Value(0),
			pan: new Animated.ValueXY(),
		};

		this.createPanResponder(props);
	}

	setModalVisible(visible: boolean) {
		const { closeFunction, height } = this.props;
		const { animatedHeight, pan } = this.state;
		if (visible) {
			this.setState({ modalVisible: visible });
			Animated.timing(animatedHeight, {
				toValue: height,
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			Animated.timing(animatedHeight, {
				toValue: 0,
				duration: 400,
				useNativeDriver: false,
			}).start(() => {
				pan.setValue({ x: 0, y: 0 });
				this.setState({
					modalVisible: visible,
					animatedHeight: new Animated.Value(0),
				});
				if (typeof closeFunction === 'function')
					closeFunction();
			});
		}
	}

	createPanResponder(props: { height: number }) {
		const { height } = props;
		const { pan } = this.state;
		panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderMove: (e, gestureState) => {
				if (gestureState.dy > 0) {
					Animated.event([null, { dy: pan.y }], {
						useNativeDriver: false,
					})(e, gestureState);
				}
			},
			onPanResponderRelease: (e, gestureState) => {
				const gestureLimitArea = height / 3;
				const gestureDistance = gestureState.dy;
				if (gestureDistance > gestureLimitArea) {
					this.setModalVisible(false);
				} else {
					Animated.spring(pan, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: false,
					}).start();
				}
			},
		});
	}
	onBackPress = () => {
		console.warn('back pressed....');
		return true;
	};

	componentDidMount() {
		this.show();
		BackHandler.addEventListener(
			'hardwareBackPress',
			this.onBackPress,
		);
	}
	componentWillUnmount() {
		BackHandler.removeEventListener(
			'hardwareBackPress',
			this.onBackPress,
		);
	}

	show() {
		this.setModalVisible(true);
	}

	close() {
		this.setModalVisible(false);
		goBack();
	}

	render() {
		const {
			children,
			hasDraggableIcon,
			backgroundColor,
			sheetBackgroundColor,
			dragIconColor,
			dragIconStyle,
			draggable = true,
			// onRequestClose,
			onClose = () => this.close(),
			radius,
		} = this.props;
		const { animatedHeight, pan, modalVisible } =
			this.state;
		const panStyle = {
			transform: pan.getTranslateTransform(),
		};

		return (
			<Modal
				transparent
				visible={modalVisible}
				onRequestClose={this.close.bind(this)}
			>
				<View
					style={[
						styles.wrapper,
						{
							backgroundColor:
								backgroundColor || '#25252599',
						},
					]}
				>
					<TouchableOpacity
						style={styles.background}
						activeOpacity={1}
						onPress={onClose}
					/>

					<Animated.View
						style={[
							panStyle,
							styles.container,
							{
								height: animatedHeight,
								borderTopRightRadius: radius || 10,
								borderTopLeftRadius: radius || 10,
								backgroundColor:
									sheetBackgroundColor || '#F3F3F3',
							},
						]}
					>
						<>
							{hasDraggableIcon && (
								<Animated.View
									{...(draggable &&
										panResponder.panHandlers)}
									style={styles.draggableContainer}
								>
									<View
										style={[
											styles.draggableIcon,
											dragIconStyle,
											{
												backgroundColor:
													dragIconColor || '#A3A3A3',
											},
										]}
									/>
								</Animated.View>
							)}
							{children}
						</>
					</Animated.View>
				</View>
			</Modal>
		);
	}
}

export default BottomSheet;

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	background: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	container: {
		width: '100%',
		height: 0,
		overflow: 'hidden',
		borderTopRightRadius: 10,
		borderTopLeftRadius: 10,
	},
	draggableContainer: {
		width: '100%',
		alignItems: 'center',
		backgroundColor: 'transparent',
		paddingBottom: 8,
	},
	draggableIcon: {
		width: 40,
		height: 6,
		borderRadius: 3,
		margin: 10,
		marginBottom: 0,
	},
});
