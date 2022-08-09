import {
	Action,
	GlobalActionTokens,
	TemplateSchema,
	TriggerAction,
} from '../types';
import { useContext, useMemo } from 'react';
import { Context } from '../context';
import { standardUtilitiesHook } from './standartUtilitiesHook';

export const triggerActionHook =
	(): TriggerAction => {
		const {
			setDataStoreInPath,
			setActions,
			state,
		} = useContext(Context);

		const standardUtilities =
			standardUtilitiesHook();

		return <(action: Action) => Promise<any>>(
			useMemo(
				() => (action: Action) => {
					switch (action.type) {
						/**
						 * Global Action Handle - Update Datastore for routeId -> widgetId
						 * */
						case GlobalActionTokens.SET_DATASTORE_IN_PATH: {
							if (setDataStoreInPath) {
								setDataStoreInPath(action);
							}
							break;
						}
						/**
						 * Global Action Handle - Set Action map for routeId
						 * */
						case GlobalActionTokens.SET_ACTIONS: {
							if (setActions) {
								setActions(action);
							}
							break;
						}

						default: {
							/**
							 * Custom Action Handle
							 * */
							const template: TemplateSchema =
								action.routeId &&
								state.routeMap &&
								state.routeMap[action.routeId].template;

							const actionsMap =
								template &&
								action.routeId &&
								state.routeMap &&
								state.routeMap[action.routeId].actions;

							if (
								actionsMap != null &&
								template.datastore != null
							) {
								actionsMap[action.type](
									action,
									template?.datastore,
									standardUtilities,
								);
							}
							break;
						}
					}
				},
				[],
			)
		);
	};
