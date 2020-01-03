import db from '../../sqlite';

import GetUsers from './getUsers';

describe('Get users from real db', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('Get all the users', () => {
		expect(GetUsers({ db })).resolves.toEqual([{ id: 1, username: 'admin' }]);
	});
});

describe('Get users from always-failing database', () => {
	test('db.all will fail', () => {
		const db = { all: jest.fn(() => Promise.reject('DB Error at all')) };
		expect(GetUsers({ db })).rejects.toBe('DB Error at all');
	});
});
