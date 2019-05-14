import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import AddGroupMember from './addGroupMember';

describe('Add group member to real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(done => {
		mockedPublish = jest.fn();
		conn = {
			db: new SQLite.Database(
				':memory:',
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (!error) {
						populate(conn.db, error => {
							if (!error) {
								conn.db.exec('PRAGMA foreign_keys=ON');

								//add sample group and ndoes
								conn.db.exec(
									`INSERT INTO groups (name) VALUES ("group1"),("group2");
									INSERT INTO nodes (uuid) VALUES ("node1"),("node2");`,
									error => {
										if (!error) {
											done();
										}
									}
								);
							}
						});
					}
				}
			),
			groupSubscription: () => ({
				publish: mockedPublish
			}),
			getGroup: jest.fn().mockReturnValue({ mocked: 'group' })
		};
	}, 10000);
	afterEach(done => {
		conn.db.close(error => {
			if (!error) {
				conn = null;
				mockedPublish = null;
				done();
			}
		});
	}, 10000);

	test('Should not add node if already added', done => {
		conn.db.exec(
			'INSERT INTO group_members (pgroup, node) VALUES (1, 1)',
			error => {
				if (!error) {
					AddGroupMember(conn, 1, 1).then(resp => {
						expect(resp).toBe(null);
						done();
					});
				}
			}
		);
	});

	test('Should not call subscription or getGroup if node already added', done => {
		conn.db.exec(
			'INSERT INTO group_members (pgroup, node) VALUES (1, 1)',
			error => {
				if (!error) {
					AddGroupMember(conn, 1, 1).then(() => {
						expect(mockedPublish).not.toBeCalled();
						expect(conn.getGroup).not.toBeCalled();
						done();
					});
				}
			}
		);
	});

	test('Should add node to group', () => {
		expect(AddGroupMember(conn, 1, 1)).resolves.toEqual({ mocked: 'group' });
	});

	test('Should add to database when adding a node', done => {
		AddGroupMember(conn, 1, 1).then(() => {
			conn.db.all('SELECT pgroup, node FROM group_members', {}, (err, rows) => {
				expect(err).toBe(null);
				expect(rows.length).toBe(1);
				expect(rows[0]).toEqual({ pgroup: 1, node: 1 });
				done();
			});
		});
	});

	test('Should call subscription when adding a node', done => {
		AddGroupMember(conn, 1, 1).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: 'group' });
			done();
		});
	});

	test('Should get group info from getGroup', done => {
		AddGroupMember(conn, 1, 1).then(() => {
			expect(conn.getGroup).toBeCalledTimes(1);
			expect(conn.getGroup).toBeCalledWith(1);
			done();
		});
	});
});

describe('Add group member to always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(AddGroupMember({ db }, 1, 1)).rejects.toBe('DB Error at get');
	});

	test('db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb(null, { count: 0 })),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(AddGroupMember({ db }, 1, 1)).rejects.toBe('DB Error at run');
	});
});
