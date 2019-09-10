import * as yup from 'yup';

import NodeSubscription from './nodeSubscription';

describe('Testing user subscription', () => {
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

	test('User subscription should return a matching object', () => {
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
				),
			mqttTrigger: yup
				.mixed()
				.test(
					'is-function',
					'not a function',
					value => typeof value === 'function'
				)
		});
		expect(schema.isValid(NodeSubscription(conn))).resolves.toBe(true);
	});

	describe('NodeSubscription.subscribe', () => {
		test('Should resolve to an async iterator', () => {
			expect(NodeSubscription(conn).subscribe()).resolves.toBe(
				'mockedAsyncIterator'
			);
		});

		test('Should call the pubsub asyncIterator function', done => {
			NodeSubscription(conn)
				.subscribe()
				.then(() => {
					expect(conn.gql.pubsub.asyncIterator).toBeCalledTimes(1);
					expect(conn.gql.pubsub.asyncIterator).toBeCalledWith(['node']);
					done();
				});
		});
	});

	describe('NodeSubscription.publish', () => {
		test('Should not return anything', () => {
			expect(
				NodeSubscription(conn).publish('CREATED', { mocked: 'node' })
			).toBe(undefined);
		});

		test('Should call the pubsub publish function', () => {
			NodeSubscription(conn).publish('CREATED', { mocked: 'node' });
			expect(conn.gql.pubsub.publish).toBeCalledTimes(1);
			expect(conn.gql.pubsub.publish).toBeCalledWith('node', {
				nodeSubscription: {
					mutation: 'CREATED',
					node: {
						mocked: 'node'
					}
				}
			});
		});

		test('Should not publish if user is null', () => {
			NodeSubscription(conn).publish('CREATED', null);
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		test('Should not publish if type not in [CREATED, UPDATED, DELETED]', () => {
			NodeSubscription(conn).publish('NOTEXISTING', { mocked: 'user' });
			expect(conn.gql.pubsub.publish).not.toBeCalled();
		});

		describe('Should call publish if type in [CREATED, UPDATED, DELETED]', () => {
			const tests = ['CREATED', 'UPDATED', 'DELETED'];
			tests.forEach(testCase => {
				test('Should call publish for ' + testCase, () => {
					NodeSubscription(conn).publish(testCase, { mocked: 'user' });
					expect(conn.gql.pubsub.publish).toBeCalled();
				});
			});
		});
	});

	describe('NodeSubscription.mqttTrigger', () => {
		var customConn = null;
		beforeEach(() => {
			customConn = {
				...conn,
				getNode: jest.fn().mockReturnValue({ mocked: 'node' }),
				db: {
					get: jest.fn().mockResolvedValue({ count: 1, id: 1 })
				}
			};
		});
		afterEach(() => {
			customConn = null;
		});

		test('Should publish if string matches a node', done => {
			const ns = NodeSubscription(customConn);
			ns.publish = jest.fn();
			ns.mqttTrigger('nodes/node1/topic1', { mocked: 'client' }).then(() => {
				expect(ns.publish).toBeCalledTimes(1);
				expect(ns.publish).toBeCalledWith('UPDATED', { mocked: 'node' });
				done();
			});
		});

		test('Should get ID from database', done => {
			const ns = NodeSubscription(customConn);
			ns.mqttTrigger('nodes/node1/topic1', { mocked: 'client' }).then(() => {
				expect(customConn.db.get).toBeCalledTimes(1);
				done();
			});
		});

		test('Should get node from connector', done => {
			const ns = NodeSubscription(customConn);
			ns.mqttTrigger('nodes/node1/topic1', { mocked: 'client' }).then(() => {
				expect(customConn.getNode).toBeCalledTimes(1);
				expect(customConn.getNode).toBeCalledWith(1);
				done();
			});
		});

		test('Should not publish if topic does not match node', done => {
			const ns = NodeSubscription(customConn);
			ns.publish = jest.fn();
			Promise.all([
				ns.mqttTrigger('asd/nodes/node1/topic1', { mocked: 'client' }),
				ns.mqttTrigger('nodes/node1', { mocked: 'client' })
			]).then(() => {
				expect(ns.publish).not.toBeCalled();
				done();
			});
		});

		test('Should not publish if client is null', done => {
			const ns = NodeSubscription(customConn);
			ns.publish = jest.fn();
			ns.mqttTrigger('nodes/node1/topic1', null).then(() => {
				expect(ns.publish).not.toBeCalled();
				done();
			});
		});

		test('Should not publish if id not found in database', done => {
			const customCustomConn = {
				...customConn,
				db: {
					get: jest.fn(() => Promise.resolve({ count: 0, id: null }))
				}
			};
			const ns = NodeSubscription(customCustomConn);
			ns.publish = jest.fn();
			ns.mqttTrigger('nodes/unknown/topic1', { mocked: 'client' }).then(() => {
				expect(ns.publish).not.toBeCalled();
				done();
			});
		});
	});
});
