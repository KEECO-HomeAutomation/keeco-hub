import SQLite from 'sqlite3';
import populate from '../sqlite/populate';

import GetUsers from './getUsers';

describe('Get users from real db', () => {
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

	test('Get all the users', () => {
		expect(GetUsers({ db })).resolves.toEqual([{ id: 1, username: 'admin' }]);
	});
});

describe('Get users from always-failing database', () => {
	test('db.all will fail', () => {
		const db = { all: jest.fn((sql, props, cb) => cb('DB Error at all')) };
		expect(GetUsers({ db })).rejects.toBe('DB Error at all');
	});
});
