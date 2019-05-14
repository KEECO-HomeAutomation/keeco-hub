import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetGroupMembers from './getGroupMembers';

describe('Get group members from real database', () => {
	var conn = null;
	beforeEach(done => {
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
									INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
									INSERT INTO group_members (pgroup, node) VALUES (1, 1),(1, 2);`,
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
			)
		};
	}, 10000);
	afterEach(done => {
		conn.db.close(error => {
			if (!error) {
				conn = null;
				done();
			}
		});
	}, 10000);

	test('Should resolve to empty array if group does not exist', () => {
		expect(GetGroupMembers(conn, 400)).resolves.toEqual([]);
	});

	test('Should resolve to an arrat of nodes', () => {
		expect(GetGroupMembers(conn, 1)).resolves.toEqual([
			{ id: 1, uuid: 'node1', name: null },
			{ id: 2, uuid: 'node2', name: null }
		]);
	});
});

describe('Get group members from always failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetGroupMembers({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
