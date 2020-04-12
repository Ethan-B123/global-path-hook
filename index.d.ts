import * as React from 'react';
import {
	HookMiddlewareFn,
	SetValueMiddlewareFn,
	SetGlobalState,
} from './types';

export {
	HookMiddlewareFn,
	SetValueMiddlewareFn,
	SetGlobalState,
} from './types';

export function useGlobalState<T>(
	path: string,
	defaultValue: T
): [T, SetGlobalState<T>];

export function useGlobalState<T, U>(
	path: string,
	defaultValue: T
): [T | U, SetGlobalState<T | U>];

export interface GlobalStateProviderProps {
	children: React.ReactNode;
	initialValue: any;
	hookMiddleware?: HookMiddlewareFn[];
	setValueMiddleware?: SetValueMiddlewareFn[];
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps>;
