import Connector from './index';

describe('Testing main connector', () => {
	test('Callback should be called when init finished', () => {
		const cb = jest.fn();
		Connector.init({ db: null, mqtt: null, gql: null }, cb);
		expect(cb).toBeCalled();
	});
});
