import React, {
	useState,
	useEffect,
	createContext,
	useRef,
	useContext,
} from 'react';
import cloneDeep from 'lodash.clonedeep';
import toPath from 'lodash.topath';
import set from 'lodash.set';
import has from 'lodash.has';
import at from 'lodash.at';

const GlobalStateContext = createContext({});

export const useGlobalState = (inputPath, defaultValue) => {
	const { current } = useContext(GlobalStateContext);

	for (let fn of current.hookMiddleware) {
		const returned = fn(inputPath, defaultValue);
		if (returned.hasOwnProperty('inputPath')) inputPath = returned.inputPath;
		if (returned.hasOwnProperty('defaultValue'))
			defaultValue = returned.defaultValue;
	}

	const valueFoundInState = has(current.state, inputPath);

	const [value, _setValue] = useState(
		valueFoundInState ? at(current.state, inputPath)[0] : defaultValue
	);

	_setValue.__deleted_parent = () => _setValue(defaultValue);

	// called by the middleware
	const setValue = ({ path: inputPath, newValue }) => {
		const clone = cloneDeep(current.state);
		if (typeof newValue === 'function')
			newValue = newValue(
				has(current.state, inputPath)
					? at(current.state, inputPath)[0]
					: defaultValue
			);
		set(clone, inputPath, newValue);
		current.state = clone;

		const arrayPath = toPath(inputPath);
		const currentStringPath = arrayPath.join('.');

		// everything up the state tree + self
		arrayPath.forEach((key, idx) => {
			const thisArrayPath = arrayPath.slice(0, idx + 1);
			const thisStringPath = thisArrayPath.join('.');
			const handlers = current.allHandlers[thisStringPath];
			if (handlers) {
				const updatedObj = at(clone, thisStringPath)[0];
				handlers.forEach((fn) => fn(updatedObj));
			}
		});

		// all children of path
		const childPaths = Object.keys(current.allHandlers).filter(
			(otherStringPath) =>
				otherStringPath.startsWith(currentStringPath) &&
				otherStringPath !== currentStringPath
		);
		childPaths.forEach((path) => {
			current.allHandlers[path].forEach((fn) => {
				if (has(clone, path)) {
					fn(at(clone, path)[0]);
				} else {
					fn.__deleted_parent();
				}
			});
		});
	};

	const withMiddleware = (newValue, passedExtra) => {
		const saved = {
			path: inputPath,
			newValue: newValue,
			defaultValue: defaultValue,
			currentState: current.state,
			currentSlice: valueFoundInState
				? at(current.state, inputPath)[0]
				: defaultValue,
		};
		let extraArg = passedExtra;

		const inputProps = Object.keys(saved);

		const includeArgs = (thisFn, next) => (input, middlewareExtra) => {
			if (typeof input !== 'object') input = {};
			if (typeof middlewareExtra === 'undefined') {
			} else if (
				!Array.isArray(middlewareExtra) &&
				!Array.isArray(extraArg) &&
				typeof middlewareExtra === 'object' &&
				typeof extraArg === 'object'
			) {
				extraArg = { ...extraArg, ...middlewareExtra };
			} else {
				extraArg = middlewareExtra;
			}

			inputProps.forEach((prop) => {
				if (input.hasOwnProperty(prop)) {
					saved[prop] = input[prop];
				} else {
					input[prop] = saved[prop];
				}
			});
			thisFn(
				{
					...input,
					next,
					startOver: withMiddleware,
				},
				extraArg
			);
		};

		const middlewares = [...current.setValueMiddleware].reverse();
		let next = includeArgs(setValue);

		for (let fn of middlewares) {
			next = includeArgs(fn, next);
		}

		next({});
	};

	useEffect(() => {
		const arrayPath = toPath(inputPath);
		const stringPath = arrayPath.join('.');
		if (!current.allHandlers[stringPath]) current.allHandlers[stringPath] = [];
		current.allHandlers[stringPath].push(_setValue);

		return () => {
			const idx = current.allHandlers[stringPath].indexOf(_setValue);
			current.allHandlers[stringPath].splice(idx, 1);
		};
	});

	return [value, withMiddleware];
};

export const GlobalStateProvider = ({
	children,
	initialValue = {},
	hookMiddleware = [],
	setValueMiddleware = [],
}) => {
	const globalState = useRef({
		state: initialValue,
		hookMiddleware: hookMiddleware,
		setValueMiddleware: setValueMiddleware,
		allHandlers: {},
	});

	return React.createElement(
		GlobalStateContext.Provider,
		{ value: globalState },
		children
	);
};
