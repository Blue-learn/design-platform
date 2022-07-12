import { StandardUtilities } from '../types';

export const standardUtilities: StandardUtilities =
	{
		/** todo **/
		reloadPage(reloadParams?: any) {},
		getFromDataStore(path: string): Promise<any> {
			return Promise.resolve(undefined);
		},
		/** todo **/
		scrollToId(options: any): void {},
		setInDataStore(
			path: string,
			value?: any,
		): Promise<any> {
			return Promise.resolve(undefined);
		},
		/** todo **/
		showToast(toastProps: any) {},
		showLoader(loaderParams?: any) {},
		hideLoader() {},
		showPopup(params: any) {},
		hidePopup() {},
	};
