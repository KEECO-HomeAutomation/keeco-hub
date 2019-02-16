import SQLite from 'sqlite3';
import MQTTStore from 'mqtt-store';
import populate from '../../sqlite/populate';

import GetEndpointForMapping from './getEndpointForMapping';

describe('Get endpoints for mapping from real database', () => {
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
								`INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2");
								INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp");`,
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

	test('Should return an empty array if mapping does not exist', () => {
		expect(GetEndpointForMapping({ db, mqtt }, 400)).resolves.toBe(null);
	});

	test('Should return an endpoint for NodeTemplateMapping.ID=1', done => {
		db.exec(
			`INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep1", 1, "10:15"),(1, "ep2", 0, "0:.1");
			INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1);`,
			error => {
				mqtt.store.put('nodes/uuid1/ep1', 'value1');
				if (!error) {
					expect(
						GetEndpointForMapping({ db, mqtt }, 1, 'uuid1')
					).resolves.toEqual({
						id: 1,
						name: 'ep1',
						output: true,
						range: '10:15',
						value: 'value1'
					});
					done();
				}
			}
		);
	});
});

describe('Get endpoint for mapping from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(GetEndpointForMapping({ db }, 400)).rejects.toBe('DB Error at get');
	});
});
