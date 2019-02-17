import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';
import PasswordHash from 'password-hash';

import UpdateUser from './updateUser';

describe('Update user in real db', () => {
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

	test('Update password for user 1', done => {
		UpdateUser({ db }, 1, { password: 'newPassword' }).then(res => {
			expect(res).toEqual({ id: 1, username: 'admin' });
			db.get('SELECT password FROM users WHERE id=1', undefined, (err, row) => {
				expect(PasswordHash.verify('newPassword', row.password)).toBe(true);
				done();
			});
		});
	});

	test('Update password for a random (non existing) user should not change any other user', done => {
		UpdateUser({ db }, 500, { password: 'newPassword' }).then(res => {
			expect(res).toEqual(undefined);
			db.get('SELECT password FROM users WHERE id=1', undefined, (err, row) => {
				expect(PasswordHash.verify('admin', row.password)).toBe(true);
				done();
			});
		});
	});
});

describe('Update user in always-failing database', () => {
	test('db.run will fail', () => {
		const db = { run: jest.fn((sql, props, cb) => cb('DB Error at run')) };
		expect(UpdateUser({ db }, 1, { password: 'newPassword' })).rejects.toBe(
			'DB Error at run'
		);
	});
});
