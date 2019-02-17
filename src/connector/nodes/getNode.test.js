import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetNode from './getNode';

describe('Get node from real database', () => {
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
							done();
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

	test('Should get node with id=1', done => {
		db.exec(
			'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1")',
			error => {
				if (!error) {
					expect(GetNode({ db }, 1)).resolves.toEqual({
						id: 1,
						uuid: 'uuid1',
						name: 'name1'
					});
					done();
				}
			}
		);
	});

	test('Should get node with id=1 even if multiple nodes are present', done => {
		db.exec(
			'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")',
			error => {
				if (!error) {
					expect(GetNode({ db }, 1)).resolves.toEqual({
						id: 1,
						uuid: 'uuid1',
						name: 'name1'
					});
					done();
				}
			}
		);
	});

	test('Should return null if id not found', () => {
		expect(GetNode({ db }, 400)).resolves.toBe(null);
	});
});

describe('Get node from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};

		expect(GetNode({ db }, 400)).rejects.toBe('DB Error at get');
	});
});
