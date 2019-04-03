import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';
import PasswordHash from 'password-hash';

import CreateUser from './createUser';

describe('Create user with real database', () => {
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

	test('If username already taken, resolve to null and do not insert into database', done => {
		expect(
			CreateUser(conn, { username: 'admin', password: 'password' })
		).resolves.toBe(null);
		conn.db.all('SELECT * FROM users', (err, rows) => {
			expect(err).toBe(null);
			expect(rows.length).toBe(1);
			done();
		});
	});

	test('If username available, create new user', done => {
		CreateUser(conn, { username: 'test', password: 'test' }).then(res => {
			expect(res).toEqual({ username: 'test', password: 'test', id: 2 });
			conn.db.get('SELECT * FROM users WHERE id=2', undefined, (err, row) => {
				expect(row.username).toBe('test');
				expect(PasswordHash.verify('test', row.password)).toBe(true);
				done();
			});
		});
	});

	test('It should post a subscription', done => {
		CreateUser(conn, { username: 'test', password: 'test' }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			done();
		});
	});
});

describe('Create user with always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all', null))
		};
		expect(
			CreateUser({ db }, { username: 'test', password: 'test' })
		).rejects.toBe('DB Error at all');
	});

	test('db.all passes, db.run will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb(null, [])),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(
			CreateUser({ db }, { username: 'test', password: 'test' })
		).rejects.toBe('DB Error at run');
	});
});
