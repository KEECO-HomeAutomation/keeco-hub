import db from '../../sqlite';

import GetUser from './getUser';

describe('Get user from real db', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('User not found', () => {
		expect(GetUser({ db }, 500)).resolves.toBe(undefined);
	});

	test('Get user with id=1', () => {
		expect(GetUser({ db }, 1)).resolves.toEqual({
			id: 1,
			username: 'admin'
		});
	});
});

describe('Get user from always-failing database', () => {
	test('db.get will fail', () => {
		const db = { get: jest.fn(() => Promise.reject('DB Error at get')) };
		expect(GetUser({ db }, 1)).rejects.toBe('DB Error at get');
	});
});
