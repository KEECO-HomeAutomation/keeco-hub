import * as yup from 'yup';

import GroupSubscription from './groupSubscription';

describe('Group subscriptions', () => {
	var conn = null;
	beforeEach(() => {
		conn = {
			gql: {
				pubsub: {
					asyncIterator: jest.fn().mockReturnValue('mockedAsyncIterator'),
					publish: jest.fn()
				}
			}
		};
	});
	afterEach(() => {
		conn = null;
	});

	test('GroupSubscription should return an object with two functions', () => {
		let schema = yup.object().shape({
			subscribe: yup
				.mixed()
				.test(
					'is-function',
					'not a function',
					value => typeof value === 'function'
				)
				.required(),
			publish: yup
				.mixed()
				.test(
					'is-function',
					'not a function',
					value => typeof value === 'function'
				)
				.required()
		});
		expect(schema.isValid(GroupSubscription(conn))).resolves.toBe(true);
	});

	describe('GroupSubscription.subscribe', () => {
		test('Should resolve to an async iterator', () => {
			expect(GroupSubscription(conn).subscribe()).resolves.toBe(
				'mockedAsyncIterator'
			);
		});

		test('Should call the pubsub asyncIterator function', done => {
			GroupSubscription(conn)
				.subscribe()
				.then(() => {
					expect(conn.gql.pubsub.asyncIterator).toBeCalledTimes(1);
					expect(conn.gql.pubsub.asyncIterator).toBeCalledWith(['group']);
					done();
				});
		});
	});

	describe('GroupSubscription.publish', () => {
		test('Should not return anything', () => {
			expect(
				GroupSubscription(conn).publish('CREATED', { mocked: 'group' })
			).toBe(undefined);
		});

		test('Should call the pubsub publish function', () => {
			GroupSubscription(conn).publish('CREATED', { mocked: 'group' });
			expect(conn.gql.pubsub.publish).toBeCalledTimes(1);
			expect(conn.gql.pubsub.publish).toBeCalledWith('group', {
				groupSubscription: {
					mutation: 'CREATED',
					node: {
						mocked: 'group'
					}
				}
			});
		});

		test('Should not publish if group is null', () => {
			GroupSubscription(conn).publish('CREATED', null);
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		test('Should not publish if type not in [CREATED, UPDATED, DELETED]', () => {
			GroupSubscription(conn).publish('NOTEXISTING', { mocked: 'group' });
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		describe('Should call publish if type in [CREATED, UPDATED, DELETED]', () => {
			let tests = ['CREATED', 'UPDATED', 'DELETED'];
			tests.forEach(testCase => {
				test('Should call publish for ' + testCase, () => {
					GroupSubscription(conn).publish(testCase, { mocked: 'group' });
					expect(conn.gql.pubsub.publish).toBeCalled();
				});
			});
		});
	});
});
