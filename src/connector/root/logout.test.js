import db from '../../sqlite';

import Logout from './logout';

describe('Log out user from real db', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('Should resolve to an object having a token, no matter what', () => {
		expect(Logout({ db }, 'token')).resolves.toMatchObject({ token: 'token' });
	});

	test('Do not do anything if token does not exist', done => {
		db.run('INSERT INTO auth_tokens (user, token) VALUES (1, "token")').then(
			() => {
				Logout({ db }, 'nonExistingToken').then(res => {
					db.get(
						'SELECT invalidated FROM auth_tokens WHERE token="token"'
					).then(row => {
						expect(row.invalidated).toBe(0);
						done();
					});
				});
			}
		);
	});

	test('Invalidate session', done => {
		db.run('INSERT INTO auth_tokens (user, token) VALUES (1, "token")').then(
			() => {
				Logout({ db }, 'token').then(res => {
					db.get(
						'SELECT invalidated FROM auth_tokens WHERE token="token"'
					).then(row => {
						expect(row.invalidated).toBe(1);
						done();
					});
				});
			}
		);
	});
});

describe('Log out user from always-failing database', () => {
	test('db.run will fail', () => {
		const db = { run: jest.fn(() => Promise.reject('DB Error at run')) };
		expect(Logout({ db }, 'token')).rejects.toBe('DB Error at run');
	});
});
