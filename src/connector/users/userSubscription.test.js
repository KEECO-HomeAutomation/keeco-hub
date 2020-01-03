import * as yup from 'yup';

import UserSubscription from './userSubscription';

describe('Testing user subscriptions', () => {
	let conn = null;
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

	test('UserSubscription should return an object with two functions', () => {
		const schema = yup.object().shape({
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
		expect(schema.isValid(UserSubscription(conn))).resolves.toBe(true);
	});

	describe('UserSubscription.subscribe', () => {
		test('Should resolve to an async iterator', () => {
			expect(UserSubscription(conn).subscribe()).resolves.toBe(
				'mockedAsyncIterator'
			);
		});

		test('Should call the pubsub asyncIterator function', done => {
			UserSubscription(conn)
				.subscribe()
				.then(() => {
					expect(conn.gql.pubsub.asyncIterator).toBeCalledTimes(1);
					expect(conn.gql.pubsub.asyncIterator).toBeCalledWith(['user']);
					done();
				});
		});
	});

	describe('UserSubscription.publish', () => {
		test('Should not return anything', () => {
			expect(
				UserSubscription(conn).publish('CREATED', { mocked: 'user' })
			).toBe(undefined);
		});

		test('Should call the pubsub publish function', () => {
			UserSubscription(conn).publish('CREATED', { mocked: 'user' });
			expect(conn.gql.pubsub.publish).toBeCalledTimes(1);
			expect(conn.gql.pubsub.publish).toBeCalledWith('user', {
				userSubscription: {
					mutation: 'CREATED',
					node: {
						mocked: 'user'
					}
				}
			});
		});

		test('Should not publish if user is null', () => {
			UserSubscription(conn).publish('CREATED', null);
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		test('Should not publish if type not in [CREATED, UPDATED, DELETED]', () => {
			UserSubscription(conn).publish('NOTEXISTING', { mocked: 'user' });
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		describe('Should call publish if type in [CREATED, UPDATED, DELETED]', () => {
			const tests = ['CREATED', 'UPDATED', 'DELETED'];
			tests.forEach(testCase => {
				test('Should call publish for ' + testCase, () => {
					UserSubscription(conn).publish(testCase, { mocked: 'user' });
					expect(conn.gql.pubsub.publish).toBeCalled();
				});
			});
		});
	});
});
