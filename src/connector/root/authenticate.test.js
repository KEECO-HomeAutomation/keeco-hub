import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import Authenticate from './authenticate';

describe('Authenticate with real database', () => {
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

	test('If token not found, resolve with null', () => {
		expect(Authenticate({ db }, 'InvalidToken')).resolves.toBe(null);
	});

	test('If token found, resolve with uid and username', done => {
		db.exec(
			'INSERT INTO auth_tokens (user, token) VALUES (1, "token")',
			error => {
				if (!error) {
					expect(Authenticate({ db }, 'token')).resolves.toEqual({
						uid: 1,
						username: 'admin',
						token: 'token'
					});
					done();
				}
			}
		);
	});
});

describe('Authenticate with always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get', null))
		};
		expect(Authenticate({ db }, 'token')).rejects.toBe('DB Error at get');
	});
});
