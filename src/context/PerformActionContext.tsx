import React, { useContext } from 'react';
import {
	GlobalActionType,
	TapAction,
} from '../types';
import { Context } from './GlobalContext';
import { Utility } from '../utility';

export const withPerformActionContext = (
	WrappedComponent: any,
): React.FC<any> => {
	return React.forwardRef<any, any>(
		(props, ref) => {
			const {
				setDataStoreInPath,
				setActions,
				state,
			} = useContext(Context);

			const handlePerformAction = (
				data: TapAction,
			) => {
				switch (data.type) {
					/**
					 * Global Action Handle
					 * */
					case GlobalActionType.SET_DATASTORE_IN_PATH:
						setDataStoreInPath(data);
						break;
					case GlobalActionType.SET_ACTIONS: {
						setActions(data);
						break;
					}

					default: {
						/**
						 * Custom Action Handle
						 * */
						// console.warn('custom actions', actions);
						// console.warn('custom data', data);
						state.actions &&
							Object.values(state.actions).length > 0 &&
							data.type &&
							data.payload &&
							state.actions[data.type](
								data.payload,
								state,
								Utility,
							);
						break;
					}
				}
			};

			return (
				<WrappedComponent
					{...props}
					ref={ref}
					performTapAction={handlePerformAction}
				/>
			);
		},
	);
};
