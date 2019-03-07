import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetNodesByTemplate from './getNodesByTemplate';

describe('Get nodes by template from real database', () => {
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

							//add data
							db.exec(
								`INSERT INTO nodes (uuid, name) VALUES ('uuid1', 'node1'), ('uuid2', 'node2'), ('uuid3', 'node3');
								INSERT INTO node_templates (node, name) VALUES (1, 'switch'), (2, 'switch'), (3, 'switch'),
								(1, 'lamp'), (2, 'lamp'), (3, 'thermostat');`,
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

	test('Should resolve to empty array if no node found for that template', () => {
		expect(
			GetNodesByTemplate({ db }, 'NotExistingTemplateName')
		).resolves.toEqual([]);
	});

	describe('Should get the appropiate nodes', () => {
		const tests = [
			{
				input: 'switch',
				expect: [
					{
						id: 1,
						name: 'node1',
						uuid: 'uuid1'
					},
					{
						id: 2,
						name: 'node2',
						uuid: 'uuid2'
					},
					{
						id: 3,
						name: 'node3',
						uuid: 'uuid3'
					}
				]
			},
			{
				input: 'lamp',
				expect: [
					{
						id: 1,
						name: 'node1',
						uuid: 'uuid1'
					},
					{
						id: 2,
						name: 'node2',
						uuid: 'uuid2'
					}
				]
			},
			{
				input: 'thermostat',
				expect: [
					{
						id: 3,
						name: 'node3',
						uuid: 'uuid3'
					}
				]
			}
		];
		tests.forEach(testCase => {
			test('Should get all the ' + testCase.input + '(e)s', () => {
				expect(GetNodesByTemplate({ db }, testCase.input)).resolves.toEqual(
					testCase.expect
				);
			});
		});
	});
});

describe('Get nodes by template from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetNodesByTemplate({ db }, 'switch')).rejects.toBe(
			'DB Error at all'
		);
	});
});
