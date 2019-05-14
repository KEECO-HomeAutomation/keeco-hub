import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetGroup from './getGroup';

describe('Get group from real database', () => {
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

								//add sample data
								conn.db.exec(
									'INSERT INTO groups (name) VALUES ("group1"),("group2")',
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
	});

	test('Should resolve to null if group does not exist', () => {
		expect(GetGroup(conn, 400)).resolves.toBe(null);
	});

	test('Should resolve to a group', () => {
		expect(GetGroup(conn, 1)).resolves.toEqual({
			id: 1,
			name: 'group1',
			is_room: 0
		});
	});
});

describe('Get group from always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(GetGroup({ db }, 1)).rejects.toBe('DB Error at get');
	});
});
