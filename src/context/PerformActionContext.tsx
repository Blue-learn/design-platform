import React, { useContext } from 'react';
import { GlobalActionType } from '../types';
import { Context } from './GlobalContext';

/** Type definition for a tap action
 * @param type action type it can either be a custom type or the one of the predefined action types
 * @param data data that is required to be passed for the tap action
 */
export type TapAction<DataType = any> = {
	type: string;
	data: DataType extends object
		? { [k in keyof DataType]: DataType[k] }
		: any;
};

export type PerformActionFn = (
	tapAction: TapAction,
	// boolUpdateDataStore?: boolean | undefined,
) => Promise<
	any | { isError: boolean; err: Error }
>;

export type PerformTapActionFn =
	() => PerformActionFn;

const PerformActionContext =
	React.createContext<PerformTapActionFn>(
		() => async () =>
			console.log('performactioncontext'),
	);

export const withPerformActionContext = (
	WrappedComponent: any,
): React.FC<any> => {
	return React.forwardRef<any, any>(
		(props, ref) => {
			const { setDataStoreInPath } =
				useContext(Context);

			const handlePerformAction = (
				data: TapAction,
			) => {
				switch (data.type) {
					case GlobalActionType.SET_DATASTORE_IN_PATH:
						setDataStoreInPath(data);
						break;

					default:
						break;
				}
			};

			return (
				<WrappedComponent
					{...props}
					ref={ref}
					performTapAction={handlePerformAction}
					// {...value}
				/>
			);
		},
	);
};

export default PerformActionContext;
