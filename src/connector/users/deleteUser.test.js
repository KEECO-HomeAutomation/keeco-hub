import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import DeleteUser from './deleteUser';

describe('Delete user with real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(done => {
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

	test('Should resolve, even when the respected user id does not exist', () => {
		expect(DeleteUser(conn, 500)).resolves.toEqual({ id: 500 });
	});
});

describe('Delete user with always-failing database', () => {
	test('db.run will fail', () => {
		const db = { run: jest.fn((sql, props, cb) => cb('DB Error at run')) };
		expect(DeleteUser({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
