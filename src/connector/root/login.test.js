import db from '../../sqlite';

import Login from './login';

describe('Log in user from real db', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

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
			db.all('SELECT * FROM auth_tokens WHERE token=$token', {
				$token: res.token
			}).then(rows => {
				expect(rows.length).toBe(1);
				expect(rows[0].user).toBe(1);
				done();
			});
		});
	});
});

describe('Log in user from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(Login({ db }, 'admin', 'admin')).rejects.toBe('DB Error at get');
	});

	test('db.get will succeed, but db.run will fail', () => {
		const db = {
			get: jest.fn(() =>
				Promise.resolve({
					id: 1,
					username: 'admin',
					password: 'sha1$a3fea30e$1$0b601805f023f82ad83177ba748c18ed87812856'
				})
			),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(Login({ db }, 'admin', 'admin')).rejects.toBe('DB Error at run');
	});
});
