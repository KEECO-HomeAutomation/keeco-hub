import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetMapping from './getMapping';

const tests = [
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 1,
			name: 'on'
		},
		expect: 'nodes/uuid1/ep_1_switch_on'
	},
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 2,
			name: 'on'
		},
		expect: 'nodes/uuid1/ep_1_lamp_on'
	},
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 2,
			name: 'r'
		},
		expect: 'nodes/uuid1/ep_1_lamp_r'
	},
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 2,
			name: 'g'
		},
		expect: 'nodes/uuid1/ep_1_lamp_g'
	},
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 2,
			name: 'b'
		},
		expect: 'nodes/uuid1/ep_1_lamp_b'
	},
	{
		input: {
			nodeUUID: 'uuid1',
			templateID: 2,
			name: 'dim'
		},
		expect: 'nodes/uuid1/ep_1_lamp_dim'
	}
];

describe('Get mapping from real database', () => {
	var db;
	beforeEach(done => {
		db = new SQLite.Database(
			':memory:',
			SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
			error => {
				if (!error) {
					populate(db, error => {
						if (!error) {
							db.exec('PRAGMA foreign_keys=ON');

							//add base data
							db.exec(
								`INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1");
								INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp");
								INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep_1_switch_on", 1, "0,1"),
								(1, "ep_1_lamp_on", 1, "0,1"),(1, "ep_1_lamp_r", 1, "0:255"),(1, "ep_1_lamp_g", 1, "0:255"),
								(1, "ep_1_lamp_b", 1, "0:255"),(1, "ep_1_lamp_dim", 1, "0:255");
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

	test('Should resolve to null when templateID not found', () => {
		expect(GetMapping({ db }, 'uuid1', 500, 'on')).resolves.toBe(null);
	});

	test('Shoudl resolve to null when name not found', () => {
		expect(GetMapping({ db }, 'uuid1', 1, 'NotExistingMapping')).resolves.toBe(
			null
		);
	});

	describe('Test outputs', () => {
		tests.forEach(testCase => {
			test(
				'Endpoint ' +
					testCase.input.name +
					' for templateID=' +
					testCase.input.templateID +
					' should resolve',
				() => {
					expect(
						GetMapping(
							{ db },
							testCase.input.nodeUUID,
							testCase.input.templateID,
							testCase.input.name
						)
					).resolves.toBe(testCase.expect);
				}
			);
		});
	});
});

describe('Get mapping from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(GetMapping({ db }, 'uuid1', 1, 'on')).rejects.toBe(
			'DB Error at get'
		);
	});
});
