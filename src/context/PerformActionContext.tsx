import React from 'react';
import { triggerActionHook } from '../hook';

export const withPerformActionContext = (
	WrappedComponent: any,
): React.FC<any> => {
	return React.forwardRef<any, any>(
		(props, ref) => {
			const triggerAction = triggerActionHook();

			return (
				<WrappedComponent
					{...props}
					ref={ref}
					triggerAction={triggerAction}
				/>
			);
		},
	);
};
