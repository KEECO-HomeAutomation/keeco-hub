import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';
import MQTTStore from 'mqtt-store';

import GetGroupData from './getGroupData';

describe('Get group data from real database', () => {
	var conn = null;
	beforeEach(done => {
		conn = {
			db: new SQLite.Database(
				':memory:',
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (!error) {
						populate(conn.db, error => {
							if (!error) {
								conn.db.exec('PRAGMA foreign_keys=ON');

								//add sample data
								conn.db.exec(
									`INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
									INSERT INTO node_endpoints (node, name) VALUES (1, "sw1"),(1, "sw2"),(2, "on"),(2, "r"),(2, "g"),(2, "b"),(2, "dim");
									INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "switch"),(2, "lamp");
									INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1),(2, "on", 2),(3, "on", 3),(3, "r", 4),(3, "g", 5),(3, "b", 6),(3, "dim", 7);
									INSERT INTO groups (name) VALUES ("group1"),("group2");
									INSERT INTO group_members (pgroup, node) VALUES (1, 1),(1, 2),(2, 2);`,
									error => {
										if (!error) {
											//add mqtt data
											conn.mqtt.store.put('nodes/node1/sw1', 1);
											conn.mqtt.store.put('nodes/node1/sw2', 0);
											conn.mqtt.store.put('nodes/node2/on', 1);
											conn.mqtt.store.put('nodes/node2/r', 200);
											conn.mqtt.store.put('nodes/node2/g', 100);
											conn.mqtt.store.put('nodes/node2/b', 0);
											conn.mqtt.store.put('nodes/node2/dim', 250);

											done();
										}
									}
								);
							}
						});
					}
				}
			),
			mqtt: {
				store: new MQTTStore()
			},
			getMapping: (uuid, templateID, endpoint) => {
				if (uuid === 'node1' && templateID === 1 && endpoint === 'on') {
					return 'nodes/node1/sw1';
				}
				if (uuid === 'node2' && templateID === 3) {
					return 'nodes/node2/' + endpoint;
				}
				return null;
			}
		};
	}, 10000);
	afterEach(done => {
		conn.db.close(error => {
			if (!error) {
				conn = null;
				done();
			}
		});
	}, 10000);

	test('Should resolve to the first value of the common endpoints', () => {
		expect(GetGroupData(conn, 1)).resolves.toEqual([{ name: 'on', value: 1 }]);
	});

	test('Should resolve to an empty array if group does not exists', () => {
		expect(GetGroupData(conn, 400)).resolves.toEqual([]);
	});

	test('Should get all the common endpoints', () => {
		expect(GetGroupData(conn, 2)).resolves.toEqual([
			{ name: 'on', value: 1 },
			{ name: 'r', value: 200 },
			{ name: 'g', value: 100 },
			{ name: 'b', value: 0 },
			{ name: 'dim', value: 250 }
		]);
	});

	test('Should reject if getMapping fails', () => {
		const customConn = {
			...conn,
			getMapping: jest
				.fn()
				.mockReturnValue(
					new Promise((resolve, reject) =>
						setTimeout(() => reject('Error at getMapping'), 500)
					)
				)
		};
		expect(GetGroupData(customConn, 1)).rejects.toBe('Error at getMapping');
	});
});

describe('Get group data from always failing database', () => {
	test('First db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all:1'))
		};
		expect(GetGroupData({ db }, 1)).rejects.toBe('DB Error at all:1');
	});

	test('Second db.all will fail', () => {
		const db = {
			all: jest
				.fn()
				.mockImplementationOnce((sql, props, cb) =>
					cb(null, [{ id: 1 }, { id: 2 }, { id: 3 }])
				)
				.mockImplementation((sql, props, cb) => cb('DB Error at all:2'))
		};
		expect(GetGroupData({ db }, 1)).rejects.toBe('DB Error at all:2');
	});

	test('db.get will fail', () => {
		const db = {
			all: jest
				.fn()
				.mockImplementationOnce((sql, props, cb) =>
					cb(null, [{ id: 1 }, { id: 2 }])
				)
				.mockImplementationOnce((sql, props, cb) => cb(null, [{ name: 'on' }]))
				.mockImplementation((sql, props, cb) => cb(null, [{ name: 'on' }])),
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(GetGroupData({ db }, 1)).rejects.toBe('DB Error at get');
	});
});
