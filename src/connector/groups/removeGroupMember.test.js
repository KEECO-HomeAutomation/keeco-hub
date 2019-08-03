import db from '../../sqlite';

import RemoveGroupMember from './removeGroupMember';

describe('Remove group member from real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				groupSubscription: () => ({
					publish: mockedPublish
				}),
				getGroup: jest.fn().mockReturnValue({ mocked: 'group' })
			};

			return conn.db
				.exec(`INSERT INTO groups (name) VALUES ("group1"),("group2");
						INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
						INSERT INTO group_members (pgroup, node) VALUES (1, 1),(1, 2),(2, 1);`);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to null if node not part of group', () => {
		expect(RemoveGroupMember(conn, 2, 2)).resolves.toBe(null);
	});

	test('Should not publish subscription if not part of group', done => {
		RemoveGroupMember(conn, 2, 2).then(() => {
			expect(mockedPublish).not.toBeCalled();
			done();
		});
	});

	test('Should remove node from group', () => {
		expect(RemoveGroupMember(conn, 1, 1)).resolves.toEqual({ mocked: 'group' });
	});

	test('Should remove node from database', done => {
		RemoveGroupMember(conn, 1, 1).then(() => {
			conn.db.all('SELECT pgroup, node FROM group_members').then(rows => {
				//should live the other entries untouched
				expect(rows.length).toBe(2);
				expect(rows[0]).toEqual({ pgroup: 1, node: 2 });
				expect(rows[1]).toEqual({ pgroup: 2, node: 1 });
				done();
			});
		});
	});

	test('Should publish subscription when removing a node', () => {
		RemoveGroupMember(conn, 1, 1).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: 'group' });
		});
	});
});

describe('Remove group member from always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(RemoveGroupMember({ db }, 1, 1)).rejects.toBe('DB Error at get');
	});

	test('db.run will fail', () => {
		const db = {
			get: jest.fn(() => Promise.resolve({ count: 1 })),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(RemoveGroupMember({ db }, 1, 1)).rejects.toBe('DB Error at run');
	});
});
