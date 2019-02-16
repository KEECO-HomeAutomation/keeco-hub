import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import Logout from './logout';

describe('Log out user from real db', () => {
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

	test('Invalidate session', done => {
		db.run(
			'INSERT INTO auth_tokens (user, token) VALUES (1, "token")',
			error => {
				if (!error) {
					Logout({ db }, 'token').then(res => {
						expect(res).toEqual({ token: 'token' });
						db.get(
							'SELECT invalidated FROM auth_tokens WHERE token="token"',
							undefined,
							(err, row) => {
								expect(row.invalidated).toBe(1);
								done();
							}
						);
					});
				}
			}
		);
	});
});

describe('Log out user from always-failing database', () => {
	test('db.run will fail', () => {
		const db = { run: jest.fn((sql, props, cb) => cb('DB Error at run')) };
		expect(Logout({ db }, 'token')).rejects.toBe('DB Error at run');
	});
});
