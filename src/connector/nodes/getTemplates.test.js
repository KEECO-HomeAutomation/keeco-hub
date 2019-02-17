import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetTemplates from './getTemplates';

describe('Get templates from real database', () => {
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
								INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp"),(1, "thermostat");`,
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

	test('Should return an empty array if node does not exist', () => {
		expect(GetTemplates({ db }, 400)).resolves.toEqual([]);
	});

	test('Should return an empty array if no templates available', () => {
		expect(GetTemplates({ db }, 2)).resolves.toEqual([]);
	});

	test('Should return an array of templates', () => {
		expect(GetTemplates({ db }, 1)).resolves.toEqual([
			{
				id: 1,
				name: 'switch'
			},
			{
				id: 2,
				name: 'lamp'
			},
			{
				id: 3,
				name: 'thermostat'
			}
		]);
	});
});

describe('Get templates from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetTemplates({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
