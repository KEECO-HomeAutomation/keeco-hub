import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import Login from './login';

describe('Log in user from real db', () => {
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

	test('Username not found', () => {
		expect(Login({ db }, 'notExistingUser', 'password')).resolves.toBe(null);
	});

	test('Incorrect password', () => {
		expect(Login({ db }, 'admin', 'incorrectPassword')).resolves.toBe(null);
	});

	test('Correct credintials', done => {
		Login({ db }, 'admin', 'admin').then(res => {
			//expect a 32 character long token
			expect(res.token).toMatch(/^\S{32}$/);
			db.all(
				'SELECT * FROM auth_tokens WHERE token=$token',
				{ $token: res.token },
				(err, rows) => {
					expect(rows.length).toBe(1);
					expect(rows[0].user).toBe(1);
					done();
				}
			);
		});
	});
});

describe('Log in user from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get', null))
		};
		expect(Login({ db }, 'admin', 'admin')).rejects.toBe('DB Error at get');
	});

	test('db.get will succeed, but db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) =>
				cb(null, {
					id: 1,
					username: 'admin',
					password: 'sha1$a3fea30e$1$0b601805f023f82ad83177ba748c18ed87812856'
				})
			),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(Login({ db }, 'admin', 'admin')).rejects.toBe('DB Error at run');
	});
});
