import db from '../../sqlite';

import DeleteUser from './deleteUser';

describe('Delete user with real database', () => {
	let mockedPublish = null;
	let conn = null;
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

	test('User with id=1 should be deleted', () => {
		DeleteUser(conn, 1).then(res => {
			expect(res).toEqual({ id: 1 });
			expect(conn.db.all('SELECT * FROM users')).resolves.toHaveLength(0);
		});
	});

	test('Should resolve to null when the requested user does not exist', () => {
		expect(DeleteUser(conn, 500)).resolves.toBe(null);
	});

	test('Should not bother other users', async () => {
		DeleteUser(conn, 500);
		expect(await conn.db.all('SELECT * FROM users')).toHaveLength(1);
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
		const db = { get: jest.fn(() => Promise.reject('DB Error at get')) };
		expect(DeleteUser({ db }, 1)).rejects.toBe('DB Error at get');
	});
	test('db.get will pass, db.run will fail', () => {
		const db = {
			get: jest.fn(() => Promise.resolve({ count: 1, username: 'admin' })),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(DeleteUser({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
