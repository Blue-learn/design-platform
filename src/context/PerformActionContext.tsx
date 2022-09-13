import React from 'react';

export const withPerformActionContext = (
	WrappedComponent: any,
): React.FC<any> => {
	return React.forwardRef<any, any>(
		(props, ref) => {
			return <WrappedComponent {...props} />;
		},
	);
};
