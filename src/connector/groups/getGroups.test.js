import db from '../../sqlite';

import GetGroups from './getGroups';

describe('Get groups from real database', () => {
	beforeEach(() =>
		db.initTest().then(() => {
			return db.exec('INSERT INTO groups (name) VALUES ("group1"),("group2");');
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to an array of groups', () => {
		expect(GetGroups({ db })).resolves.toEqual([
			{ id: 1, name: 'group1', is_room: 0 },
			{ id: 2, name: 'group2', is_room: 0 }
		]);
	});
});

describe('Get groups from always failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetGroups({ db })).rejects.toBe('DB Error at all');
	});
});
