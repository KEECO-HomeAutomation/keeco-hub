import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetGroups from './getGroups';

describe('Get groups from real database', () => {
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
									'INSERT INTO groups (name) VALUES ("group1"),("group2");',
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

	test('Should resolve to an array of groups', () => {
		expect(GetGroups(conn)).resolves.toEqual([
			{ id: 1, name: 'group1', is_room: 0 },
			{ id: 2, name: 'group2', is_room: 0 }
		]);
	});
});

describe('Get groups from always failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetGroups({ db })).rejects.toBe('DB Error at all');
	});
});
