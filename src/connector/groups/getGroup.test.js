import db from '../../sqlite';

import GetGroup from './getGroup';

describe('Get group from real database', () => {
	beforeEach(() =>
		db.initTest().then(() => {
			return db.exec('INSERT INTO groups (name) VALUES ("group1"),("group2")');
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to null if group does not exist', () => {
		expect(GetGroup({ db }, 400)).resolves.toBe(null);
	});

	test('Should resolve to a group', () => {
		expect(GetGroup({ db }, 1)).resolves.toEqual({
			id: 1,
			name: 'group1',
			is_room: 0
		});
	});
});

describe('Get group from always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(GetGroup({ db }, 1)).rejects.toBe('DB Error at get');
	});
});
