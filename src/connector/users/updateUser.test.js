import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';
import PasswordHash from 'password-hash';

import UpdateUser from './updateUser';

describe('Update user in real db', () => {
	var conn = null;
	var mockedPublish = null;
	beforeEach(done => {
		mockedPublish = jest.fn();
		conn = {
			db: new SQLite.Database(
				':memory:',
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (!error) {
						populate(conn.db, error => {
							if (!error) {
								conn.db.exec('PRAGMA foreign_keys=ON');
								done();
							}
						});
					}
				}
			),
			userSubscription: () => ({
				publish: mockedPublish
			})
		};
	}, 10000);
	afterEach(done => {
		conn.db.close(error => {
			if (!error) {
				conn = null;
				mockedPublish = null;
				done();
			}
		});
	}, 10000);

	test('Update password for user 1', done => {
		const customConn = {
			...conn,
			getUser: jest
				.fn()
				.mockReturnValue(Promise.resolve({ id: 1, username: 'admin' }))
		};
		UpdateUser(customConn, 1, { password: 'newPassword' }).then(res => {
			expect(customConn.getUser).toBeCalledWith(1);
			expect(res).toEqual({ id: 1, username: 'admin' });
			conn.db.get(
				'SELECT password FROM users WHERE id=1',
				undefined,
				(err, row) => {
					expect(PasswordHash.verify('newPassword', row.password)).toBe(true);
					done();
				}
			);
		});
	});

	test('Update password for a random (non existing) user should not change any other user', done => {
		const customConn = {
			...conn,
			getUser: jest.fn().mockReturnValue(null)
		};
		UpdateUser(customConn, 500, { password: 'newPassword' }).then(res => {
			expect(customConn.getUser).not.toBeCalled();
			expect(res).toBe(null);
			conn.db.get(
				'SELECT password FROM users WHERE id=1',
				undefined,
				(err, row) => {
					expect(PasswordHash.verify('admin', row.password)).toBe(true);
					done();
				}
			);
		});
	});

	test('Should resolve to null when updating a non existing user', () => {
		expect(UpdateUser(conn, 500, { password: 'newPassword' })).resolves.toBe(
			null
		);
	});

	test('Should post to subscription', done => {
		const customConn = {
			...conn,
			getUser: jest.fn().mockReturnValue({ id: 1, username: 'admin' })
		};
		UpdateUser(customConn, 1, { password: 'newPassword' }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', {
				id: 1,
				username: 'admin'
			});
			done();
		});
	});
});

describe('Update user in always-failing database', () => {
	test('db.get will fail', () => {
		const db = { get: jest.fn((sql, props, cb) => cb('DB Error at get')) };
		expect(UpdateUser({ db }, 1, { password: 'newPassword' })).rejects.toBe(
			'DB Error at get'
		);
	});
	test('db.get will pass, db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb(null, { count: 1 })),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(UpdateUser({ db }, 1, { password: 'newPassword' })).rejects.toBe(
			'DB Error at run'
		);
	});
});
