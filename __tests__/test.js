import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { SetOnClick, Read } from '../TestComponents';
import { GlobalStateProvider } from '..';

test('Renders a component without crashing', () => {
	render(
		<GlobalStateProvider>
			<SetOnClick
				value={{
					a: { a: 'aa', b: 'ab' },
					b: { a: 'ba', b: 'bb' },
				}}
				id="id"
				statePath="root"
				renderSubpaths={['a.a', 'a.b', 'b.a', 'b.b']}
			/>
		</GlobalStateProvider>
	);

	expect(screen.queryByTestId('id')).toBeInTheDocument();
	expect(screen.queryByText(/^set/i)).toBeInTheDocument();
	expect(screen.queryByText(/^unset/i)).toBeInTheDocument();
});

test('Renders initial value', () => {
	render(
		<GlobalStateProvider initialValue={{ root: 'value' }}>
			<Read statePath="root" />
		</GlobalStateProvider>
	);

	expect(screen.queryByText(/value/)).toBeInTheDocument();
});

test('Renders set value updates in listening siblings', () => {
	render(
		<GlobalStateProvider>
			<SetOnClick value={'value'} id="id" statePath="root" />
			<Read statePath="root" defaultValue="default" />
		</GlobalStateProvider>
	);

	expect(screen.queryByText(/default/)).toBeInTheDocument();
	expect(screen.queryByText(/value/)).not.toBeInTheDocument();

	fireEvent.click(screen.getByText(/^set/));

	expect(screen.queryByText(/default/)).not.toBeInTheDocument();
	expect(screen.queryByText(/value/)).toBeInTheDocument();
});

test('Renders set value updates on listeners higher in the state tree', () => {
	render(
		<GlobalStateProvider>
			<SetOnClick value={'value'} id="id" statePath="a.b.c" />
			<Read
				statePath="a"
				defaultValue={{ b: { c: 'default' } }}
				renderSubPaths={['b.c']}
			/>
		</GlobalStateProvider>
	);

	expect(screen.queryByText(/default/)).toBeInTheDocument();
	expect(screen.queryByText(/value/)).not.toBeInTheDocument();

	fireEvent.click(screen.getByText(/^set/));

	expect(screen.queryByText(/default/)).not.toBeInTheDocument();
	expect(screen.queryByText(/value/)).toBeInTheDocument();
});

test('Renders set value updates on listeners lower in the state tree', () => {
	render(
		<GlobalStateProvider>
			<SetOnClick value={{ b: { c: 'value' } }} id="id" statePath="a" />
			<Read statePath="a.b.c" defaultValue="default" />
		</GlobalStateProvider>
	);

	expect(screen.queryByText(/default/)).toBeInTheDocument();
	expect(screen.queryByText(/value/)).not.toBeInTheDocument();

	fireEvent.click(screen.getByText(/^set/));

	expect(screen.queryByText(/default/)).not.toBeInTheDocument();
	expect(screen.queryByText(/value/)).toBeInTheDocument();
});
