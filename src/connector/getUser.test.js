import SQLite from 'sqlite3';
import populate from '../sqlite/populate';

import GetUser from './getUser';

describe('Get user from real db', () => {
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

	test('User not found', () => {
		expect(GetUser({ db }, 500)).resolves.toBe(undefined);
	});

	test('Get user with id=1', () => {
		expect(GetUser({ db }, 1)).resolves.toEqual({
			id: 1,
			username: 'admin'
		});
	});
});

describe('Get user from always-failing database', () => {
	test('db.get will fail', () => {
		const db = { get: jest.fn((sql, props, cb) => cb('DB Error at get')) };
		expect(GetUser({ db }, 1)).rejects.toBe('DB Error at get');
	});
});
