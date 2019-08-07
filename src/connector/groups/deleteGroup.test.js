import db from '../../sqlite';

import DeleteGroup from './deleteGroup';

describe('Delete group from real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				groupSubscription: () => ({
					publish: mockedPublish
				})
			};

			return db.exec(`INSERT INTO groups (name) VALUES ("group1"),("group2");
							INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
							INSERT INTO group_members (pgroup, node) VALUES (1,1),(1,2),(2,1)`);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to null if group does not exist', () => {
		expect(DeleteGroup(conn, 400)).resolves.toBe(null);
	});

	test('Should not call subscription if group does not exist', done => {
		DeleteGroup(conn, 400).then(() => {
			expect(mockedPublish).not.toBeCalled();
			done();
		});
	});

	test('Should delete group', () => {
		expect(DeleteGroup(conn, 1)).resolves.toEqual({ id: 1 });
	});

	test('Should delete group from database', done => {
		DeleteGroup(conn, 1).then(() => {
			conn.db.all('SELECT name FROM groups').then(rows => {
				//group 2 should remain untouched
				expect(rows.length).toBe(1);
				expect(rows[0]).toEqual({ name: 'group2' });
				done();
			});
		});
	});

	test('Should cascade delete group members', done => {
		DeleteGroup(conn, 1).then(() => {
			conn.db.all('SELECT pgroup, node FROM group_members').then(rows => {
				//mappings of group 2 should remain untouched
				expect(rows.length).toBe(1);
				expect(rows[0]).toEqual({ pgroup: 2, node: 1 });
				done();
			});
		});
	});

	test('Should call subscription', done => {
		DeleteGroup(conn, 1).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('DELETED', {
				id: 1,
				name: 'group1',
				is_room: 0
			});
			done();
		});
	});
});

describe('Delete group from always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(DeleteGroup({ db }, 1)).rejects.toBe('DB Error at get');
	});

	test('db.run will fail', () => {
		const db = {
			get: jest.fn(() =>
				Promise.resolve({ count: 1, name: 'group1', is_room: 0 })
			),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(DeleteGroup({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
