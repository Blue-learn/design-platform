import { SCREEN_SIZE } from '../types';
import _isEqual from 'react-fast-compare';
import { Dimensions } from 'react-native';
import _forEach from 'lodash-es/forEach';

const filterProps = (
	props: any,
	allowedProps: string[],
) =>
	allowedProps.reduce((obj: any, key: string) => {
		obj[key] = props[key];
		return obj;
	}, {});

export const arePropsEqual = (
	allowedProps: string[],
) => {
	return (
		nextProps: any,
		prevProps: any,
	): boolean => {
		const isEqual = _isEqual(
			filterProps(nextProps, allowedProps),
			filterProps(prevProps, allowedProps),
		);
		return isEqual;
	};
};

export const hasEqualProps = (
	nextProps: any,
	prevProps: any,
) => {
	const isEqual = _isEqual(nextProps, prevProps);
	return isEqual;
};

export const findDiff = (
	nextProps: any,
	prevProps: any,
) => {
	if (!_isEqual(nextProps, prevProps)) {
		const diffKeys: string[] = [];
		_forEach(Object.keys(nextProps), (key) => {
			if (
				!_isEqual(nextProps[key], prevProps[key])
			) {
				diffKeys.push(key);
			}
		});
		return diffKeys;
	}
	return [];
};

export const getScreenType = (): SCREEN_SIZE => {
	const screenWidth =
		Dimensions.get('window').width;
	if (screenWidth < 576)
		return SCREEN_SIZE.X_SMALL;
	if (screenWidth < 768) return SCREEN_SIZE.SMALL;
	if (screenWidth < 992) return SCREEN_SIZE.MEDIUM;
	if (screenWidth < 1200) return SCREEN_SIZE.LARGE;
	if (screenWidth >= 1200)
		return SCREEN_SIZE.X_LARGE;

	return SCREEN_SIZE.X_SMALL;
};

export const getUniqueId = (): string => {
	return Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 5);
};
