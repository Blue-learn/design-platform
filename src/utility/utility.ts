export const Utility = () => {
	let _utility: any;
	let _initialized = false;

	const initialize = () => {
		if (!_initialized) {
			_utility = Utility;
			_initialized = true;
		}
	};

	const getInstance = () => {
		initialize();
		return _utility;
	};

	const modal = (isModal: boolean) => {};

	const openLink = (link: string) => {};

	const setDatastoreInPath = () => {};

	const networkCall = () => {};

	const showToast = () => {};

	const showNotification = () => {};

	return {
		init: initialize,
		getInstance,
	};
};
