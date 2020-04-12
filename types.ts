export type HookMiddlewareFn = (
	inputPath: string,
	defaultValue: any
) => void | { inputPath?: string; defaultValue?: any };

export type SetGlobalState<T> = (
	newValue: Parameters<React.Dispatch<React.SetStateAction<T>>>[0],
	extraMiddlewareArg?: any
) => void;
interface ProvidedSetValueMiddlewareArgs {
	path: string;
	newValue: any;
	defaultValue: any;
	currentState: any;
	currentSlice: any;
	next: (props?: OptionalSetValueMiddlewareArgs, middlewareExtra?: any) => void;
	startOver: SetGlobalState<any>;
}

interface OptionalSetValueMiddlewareArgs {
	path?: string;
	newValue?: any;
	defaultValue?: any;
	currentState?: any;
	currentSlice?: any;
}

export type SetValueMiddlewareFn = (
	args: ProvidedSetValueMiddlewareArgs,
	...rest: any[]
) => void;
