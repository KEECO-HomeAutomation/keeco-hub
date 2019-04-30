import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import UpdateGroup from './updateGroup';

describe('Update group in real database', () => {
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

	test('Should resolve to null if group not found', () => {
		expect(
			UpdateGroup(conn, 400, { name: 'newName', is_room: 1 })
		).resolves.toBe(null);
	});

	test('Should not post subscription if group not found', done => {
		UpdateGroup(conn, 400, { name: 'newName', is_room: 1 }).then(() => {
			expect(mockedPublish).not.toBeCalled();
			done();
		});
	});

	test('Should update group', () => {
		expect(
			UpdateGroup(conn, 1, { name: 'newName', is_room: 1 })
		).resolves.toEqual({ mocked: 'group' });
	});

	test('Should update group in database', done => {
		UpdateGroup(conn, 1, { name: 'newName', is_room: 1 }).then(() => {
			conn.db.all('SELECT id, name, is_room FROM groups', {}, (err, rows) => {
				expect(err).toBe(null);
				//should leave other group untouched
				expect(rows.length).toBe(2);
				expect(rows[0]).toEqual({ id: 1, name: 'newName', is_room: 1 });
				expect(rows[1]).toEqual({ id: 2, name: 'group2', is_room: 0 });
				done();
			});
		});
	});

	test('Should post subscription after updating', done => {
		UpdateGroup(conn, 1, { name: 'newName', is_room: 1 }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: 'group' });
			done();
		});
	});

	test('Should get group info from getGroup', done => {
		UpdateGroup(conn, 1, { name: 'newName', is_room: 1 }).then(() => {
			expect(conn.getGroup).toBeCalledTimes(1);
			expect(conn.getGroup).toBeCalledWith(1);
			done();
		});
	});
});

describe('Update group in always failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(
			UpdateGroup({ db }, 1, { name: 'newName', is_room: 1 })
		).rejects.toBe('DB Error at get');
	});

	test('db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb(null, { count: 1 })),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(
			UpdateGroup({ db }, 1, { name: 'newName', is_room: 1 })
		).rejects.toBe('DB Error at run');
	});
});
