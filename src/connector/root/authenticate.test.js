import db from '../../sqlite';

import Authenticate from './authenticate';

describe('Authenticate with real database', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('If token not found, resolve with null', () => {
		expect(Authenticate({ db }, 'InvalidToken')).resolves.toBe(null);
	});

	test('If token found, resolve with uid and username', done => {
		db.exec('INSERT INTO auth_tokens (user, token) VALUES (1, "token")').then(
			() => {
				expect(Authenticate({ db }, 'token')).resolves.toEqual({
					uid: 1,
					username: 'admin',
					token: 'token'
				});
				done();
			}
		);
	});
});

describe('Authenticate with always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(Authenticate({ db }, 'token')).rejects.toBe('DB Error at get');
	});
});
