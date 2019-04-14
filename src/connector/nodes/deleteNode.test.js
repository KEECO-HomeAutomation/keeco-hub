import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import DeleteNode from './deleteNode';

describe('Delete node from real database', () => {
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

								//add sample nodes
								conn.db.exec(
									'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "node1"),("uuid2", "node2")',
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
			nodeSubscription: () => ({
				publish: mockedPublish
			})
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

	test('Should resolve with an object containing id if delete successful', () => {
		expect(DeleteNode(conn, 1)).resolves.toEqual({ id: 1 });
	});

	test('Should delete the node from the database', done => {
		DeleteNode(conn, 1).then(() => {
			conn.db.get(
				'SELECT COUNT(id) AS count FROM nodes WHERE id=$id',
				{ $id: 1 },
				(error, row) => {
					expect(row.count).toBe(0);
					done();
				}
			);
		});
	});

	test('Should not hurt any other node the deletion of one node', done => {
		DeleteNode(conn, 1).then(() => {
			conn.db.get(
				'SELECT COUNT(id) AS count FROM nodes WHERE id=$id',
				{ $id: 2 },
				(error, row) => {
					expect(row.count).toBe(1);
					done();
				}
			);
		});
	});

	test('If node does not exist should resolve to null', () => {
		expect(DeleteNode(conn, 500)).resolves.toBe(null);
	});

	test('Should post subscription if deletion successful', done => {
		DeleteNode(conn, 1).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('DELETED', {
				id: 1,
				uuid: 'uuid1',
				name: 'node1'
			});
			done();
		});
	});

	test('Should not post subscription if no deletion happened', done => {
		DeleteNode(conn, 500).then(() => {
			expect(mockedPublish).not.toBeCalled();
			done();
		});
	});
});

describe('Delete node from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at get'))
		};
		expect(DeleteNode({ db }, 1)).rejects.toBe('DB Error at get');
	});

	test('db.get will pass, db.run will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) =>
				cb(null, { count: 1, uuid: 'uuid1', name: 'node1' })
			),
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(DeleteNode({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
