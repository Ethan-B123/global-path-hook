import React from 'react';
import { useGlobalState } from '..';

import has from 'lodash.has';
import at from 'lodash.at';

const Read = ({ statePath, renderSubPaths = [], defaultValue = null }) => {
	const [state] = useGlobalState(statePath, defaultValue);

	let renderValues = [];
	if (renderSubPaths.length) {
		renderValues = renderSubPaths
			.filter((key) => has(state, key))
			.map((key) => at(state, key)[0])
			.map((val) => (typeof val === 'string' ? val : 'object'));
	} else {
		renderValues = [state];
	}

	return renderValues.map((val, idx) => (
		<span key={`${val},${idx}`}>{val}</span>
	));
};

export default Read;
