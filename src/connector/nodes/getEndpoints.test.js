import SQLite from 'sqlite3';
import MQTTStore from 'mqtt-store';
import populate from '../../sqlite/populate';

import GetEndpoints from './getEndpoints';

describe('Get endpoints from real database', () => {
	var db = null;
	var mqtt = null;
	beforeEach(done => {
		mqtt = { store: new MQTTStore() };
		db = new SQLite.Database(
			':memory:',
			SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
			error => {
				if (!error) {
					populate(db, error => {
						if (!error) {
							db.exec('PRAGMA foreign_keys=ON');

							//add sample nodes
							db.exec(
								'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")',
								error => {
									if (!error) {
										done();
									}
								}
							);
						}
					});
				}
			}
		);
	}, 10000);
	afterEach(done => {
		mqtt = null;
		db.close(error => {
			if (!error) {
				db = null;
				done();
			}
		});
	}, 10000);

	test('Should return an empty array if no endpoints', () => {
		expect(GetEndpoints({ db, mqtt }, 1, 'uuid1')).resolves.toEqual([]);
	});

	test('Should return an array of endpoints for Node.ID=1', done => {
		db.exec(
			'INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep1", 1, "10:15"),(1, "ep2", 0, "0:.1")',
			error => {
				mqtt.store.put('nodes/uuid1/ep1', 'value1');
				if (!error) {
					expect(GetEndpoints({ db, mqtt }, 1, 'uuid1')).resolves.toEqual([
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
				}
			}
		);
	});

	test('Should return only the endpoints for the requested node', done => {
		db.exec(
			'INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep1", 1, "10:15"),(1, "ep2", 0, "0:.1"),(2, "ep3", 0, "1,2,3")',
			error => {
				mqtt.store.put('nodes/uuid1/ep1', 'value1');
				if (!error) {
					expect(GetEndpoints({ db, mqtt }, 1, 'uuid1')).resolves.toEqual([
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
				}
			}
		);
	});
});

describe('Get endpoints from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetEndpoints({ db })).rejects.toBe('DB Error at all');
	});
});
