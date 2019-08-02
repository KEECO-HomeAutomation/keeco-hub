import db from '../../sqlite';
import PasswordHash from 'password-hash';

import CreateUser from './createUser';

describe('Create user with real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				userSubscription: () => ({
					publish: mockedPublish
				})
			};
		})
	);
	afterEach(() => db.close(false));

	test('If username already taken, resolve to null and do not insert into database', () => {
		expect(
			CreateUser(conn, { username: 'admin', password: 'password' })
		).resolves.toBe(null);
		expect(conn.db.all('SELECT * FROM users')).resolves.toHaveLength(1);
	});

	test('If username available, create new user', done => {
		CreateUser(conn, { username: 'test', password: 'test' }).then(res => {
			expect(res).toEqual({ username: 'test', password: 'test', id: 2 });
			conn.db.get('SELECT * FROM users WHERE id=2').then(row => {
				expect(row.username).toBe('test');
				expect(PasswordHash.verify('test', row.password)).toBe(true);
				done();
			});
		});
	});

	test('It should post a subscription', done => {
		CreateUser(conn, { username: 'test', password: 'test' }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('CREATED', {
				id: 2,
				username: 'test'
			});
			done();
		});
	});
});

describe('Create user with always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(
			CreateUser({ db }, { username: 'test', password: 'test' })
		).rejects.toBe('DB Error at all');
	});

	test('db.all passes, db.run will fail', () => {
		const db = {
			all: jest.fn(() => Promise.resolve([])),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(
			CreateUser({ db }, { username: 'test', password: 'test' })
		).rejects.toBe('DB Error at run');
	});
});
