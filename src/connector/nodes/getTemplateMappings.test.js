import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetTemplateMappings from './getTemplateMappings';

describe('Get template mappings form real database', () => {
	var db = null;
	beforeEach(done => {
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
								INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp"),(1, "thermostat");
								INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep_1_switch_on", 1, "0,1"),
								(1, "ep_1_lamp_on", 1, "0,1"),(1, "ep_1_lamp_r", 1, "0:255"),(1, "ep_1_lamp_g", 1, "0:255"),
								(1, "ep_1_lamp_b", 1, "0:255"),(1, "ep_1_lamp_dim", 1, "0:255"),
								(1, "ep_1_thermostat_temperature", 0, "-30:70");
								INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1),
								(2, "on", 2),(2, "r", 3),(2, "g", 4),(2, "b", 5),(2, "dim", 6);`,
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
		db.close(error => {
			if (!error) {
				db = null;
				done();
			}
		});
	}, 10000);

	test('Should return an empty array if no mappings awailable', () => {
		expect(GetTemplateMappings({ db }, 3)).resolves.toEqual([]);
	});

	test('Should return an array of mappings, even if only one mapping is available', () => {
		expect(GetTemplateMappings({ db }, 1)).resolves.toEqual([
			{
				id: 1,
				name: 'on'
			}
		]);
	});

	test('Should return an array of mappings', () => {
		expect(GetTemplateMappings({ db }, 2)).resolves.toEqual([
			{
				id: 2,
				name: 'on'
			},
			{
				id: 3,
				name: 'r'
			},
			{
				id: 4,
				name: 'g'
			},
			{
				id: 5,
				name: 'b'
			},
			{
				id: 6,
				name: 'dim'
			}
		]);
	});
});

describe('Get template mappings from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetTemplateMappings({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
