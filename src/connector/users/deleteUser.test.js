import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import DeleteUser from './deleteUser';

describe('Delete user with real database', () => {
	var mockedPublish = null;
	var conn = null;
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

	test('User with id=1 should be deleted', done => {
		DeleteUser(conn, 1).then(res => {
			expect(res).toEqual({ id: 1 });
			conn.db.all('SELECT * FROM users', undefined, (err, rows) => {
				expect(rows.length).toBe(0);
				done();
			});
		});
	});

	test('Should resolve to null when the requested user does not exist', () => {
		expect(DeleteUser(conn, 500)).resolves.toBe(null);
	});

	test('Should post to the subscription', done => {
		DeleteUser(conn, 1).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('DELETED', {
				id: 1,
				username: 'admin'
			});
			done();
		});
	});
});

describe('Delete user with always-failing database', () => {
	test('db.get will fail', () => {
		const db = { get: jest.fn((sql, props, cb) => cb('DB Error at get')) };
		expect(DeleteUser({ db }, 1)).rejects.toBe('DB Error at get');
	});
	test('db.get will pass, db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) =>
				cb(null, { count: 1, username: 'admin' })
			),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(DeleteUser({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
