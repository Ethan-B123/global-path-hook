import React from 'react';
import { useGlobalState } from '..';

import has from 'lodash.has';
import at from 'lodash.at';

const SetOnClick = ({ value, statePath, renderSubpaths = [], id }) => {
	const [state, setState] = useGlobalState(statePath, null);

	const renderValues = renderSubpaths
		.filter((key) => has(state, key))
		.map((key) => at(state, key)[0])
		.map((val) => (typeof val === 'string' ? val : 'object'));

	return (
		<div data-testid={id}>
			<button onClick={() => setState(value)}>set</button>
			<button onClick={() => setState(null)}>unset</button>
			{renderValues.map((val, idx) => (
				<span key={`${val},${idx}`}>{val}</span>
			))}
		</div>
	);
};

export default SetOnClick;
