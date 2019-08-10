import db from '../../sqlite';

import GetSessions from './getSessions';

describe('Get sessions from real db', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('No sessions available', () => {
		expect(GetSessions({ db }, 1)).resolves.toEqual([]);
	});

	test('Get all the sessions', done => {
		db.exec(
			`INSERT INTO auth_tokens (user, token, issued, invalidated)
			VALUES (1, "token1", "2000-01-01 10:10:10", 0),(1, "token2", "2000-01-01 10:10:20", 1),(1, "token3", "2000-01-01 10:10:30", 0)`
		).then(() => {
			expect(GetSessions({ db }, 1)).resolves.toEqual([
				{ issued: '2000-01-01 10:10:10', invalidated: false },
				{ issued: '2000-01-01 10:10:20', invalidated: true },
				{ issued: '2000-01-01 10:10:30', invalidated: false }
			]);
			done();
		});
	});
});

describe('Get sessions from always-failing database', () => {
	test('db.all will fail', () => {
		const db = { all: jest.fn(() => Promise.reject('DB Error at all')) };
		expect(GetSessions({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
