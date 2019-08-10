import db from '../../sqlite';

import GetGroupMembers from './getGroupMembers';

describe('Get group members from real database', () => {
	beforeEach(() =>
		db.initTest().then(() => {
			return db.exec(`INSERT INTO groups (name) VALUES ("group1"),("group2");
							INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
							INSERT INTO group_members (pgroup, node) VALUES (1, 1),(1, 2);`);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to empty array if group does not exist', () => {
		expect(GetGroupMembers({ db }, 400)).resolves.toEqual([]);
	});

	test('Should resolve to an arrat of nodes', () => {
		expect(GetGroupMembers({ db }, 1)).resolves.toEqual([
			{ id: 1, uuid: 'node1', name: null },
			{ id: 2, uuid: 'node2', name: null }
		]);
	});
});

describe('Get group members from always failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetGroupMembers({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
