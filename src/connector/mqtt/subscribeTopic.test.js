import uuid from 'uuid';
import SubscribeTopic from './subscribeTopic';

jest.mock('uuid');

describe('Subscribe to topic', () => {
	var subscribeCb;
	var conn;
	beforeEach(() => {
		subscribeCb = jest.fn();
		conn = {
			mqtt: {
				aedes: {
					subscribe: jest.fn((topic, fn) => {
						fn(
							{ topic: 'topic', payload: Buffer.from('payload', 'UTF-8') },
							subscribeCb
						);
						return Promise.resolve();
					})
				}
			},
			gql: {
				pubsub: {
					publish: jest.fn(),
					asyncIterator: jest.fn().mockReturnValue({ mocked: true })
				}
			}
		};
	});
	afterEach(() => {
		subscribeCb = null;
		conn = null;
	});

	test('Should call MQTT subscribe', done => {
		SubscribeTopic(conn, 'topic').then(() => {
			expect(conn.mqtt.aedes.subscribe).toBeCalledTimes(1);
			expect(conn.mqtt.aedes.subscribe).toBeCalledWith(
				'topic',
				expect.any(Function)
			);
			done();
		});
	});

	test('When received packet should call gql.pubsub.publish', done => {
		uuid.v4.mockReturnValue('uuid');
		SubscribeTopic(conn, 'topic').then(() => {
			expect(conn.gql.pubsub.publish).toBeCalledTimes(1);
			expect(conn.gql.pubsub.publish).toBeCalledWith('mqtt_topic_uuid', {
				subscribeTopic: {
					topic: 'topic',
					payload: 'payload'
				}
			});
			done();
		});
	});

	test('When received packet should call callback', done => {
		SubscribeTopic(conn, 'topic').then(() => {
			expect(subscribeCb).toBeCalledTimes(1);
			done();
		});
	});

	test('Should call asyncIterator function of gql.pubsub', done => {
		uuid.v4.mockReturnValue('uuid');
		SubscribeTopic(conn, 'topic').then(() => {
			expect(conn.gql.pubsub.asyncIterator).toBeCalledTimes(1);
			expect(conn.gql.pubsub.asyncIterator).toBeCalledWith(['mqtt_topic_uuid']);
			done();
		});
	});

	test('Should resolve to asyncIterator', () => {
		expect(SubscribeTopic(conn, 'topic')).resolves.toEqual({ mocked: true });
	});
});
