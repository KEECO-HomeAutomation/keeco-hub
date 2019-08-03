import db from '../../sqlite';
import MQTTStore from 'mqtt-store';

import GetEndpoints from './getEndpoints';

describe('Get endpoints from real database', () => {
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			conn = {
				db,
				mqtt: { store: new MQTTStore() }
			};
			return db.exec(
				'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")'
			);
		})
	);
	afterEach(() => db.close(false));

	test('Should return an empty array if no endpoints', () => {
		expect(GetEndpoints(conn, 1, 'uuid1')).resolves.toEqual([]);
	});

	test('Should return an array of endpoints for Node.ID=1', done => {
		conn.db
			.exec(
				'INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep1", 1, "10:15"),(1, "ep2", 0, "0:.1")'
			)
			.then(() => {
				conn.mqtt.store.put('nodes/uuid1/ep1', 'value1');
				expect(GetEndpoints(conn, 1, 'uuid1')).resolves.toEqual([
					{
						id: 1,
						name: 'ep1',
						output: true,
						range: '10:15',
						value: 'value1'
					},
					{
						id: 2,
						name: 'ep2',
						output: false,
						range: '0:.1',
						value: null
					}
				]);
				done();
			});
	});

	test('Should return only the endpoints for the requested node', done => {
		conn.db
			.exec(
				'INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep1", 1, "10:15"),(1, "ep2", 0, "0:.1"),(2, "ep3", 0, "1,2,3")'
			)
			.then(() => {
				conn.mqtt.store.put('nodes/uuid1/ep1', 'value1');
				expect(GetEndpoints(conn, 1, 'uuid1')).resolves.toEqual([
					{
						id: 1,
						name: 'ep1',
						output: true,
						range: '10:15',
						value: 'value1'
					},
					{
						id: 2,
						name: 'ep2',
						output: false,
						range: '0:.1',
						value: null
					}
				]);
				done();
			});
	});
});

describe('Get endpoints from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetEndpoints({ db })).rejects.toBe('DB Error at all');
	});
});
