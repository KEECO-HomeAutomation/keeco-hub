import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import UpdateNode from './updateNode';

describe('Update node in real database', () => {
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
									'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "node1"),("uuid2", "node2");',
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

	test('Should update the database for node1', done => {
		const customConn = {
			...conn,
			getNode: jest.fn()
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(() => {
			conn.db.get(
				'SELECT id, name, uuid FROM nodes WHERE id=$id',
				{ $id: 1 },
				(err, row) => {
					if (!err) {
						expect(row).toEqual({
							id: 1,
							name: 'newName',
							uuid: 'uuid1'
						});
						done();
					}
				}
			);
		});
	});

	test('Updating node 1 should not update other nodes', done => {
		const customConn = {
			...conn,
			getNode: jest.fn()
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(() => {
			conn.db.get(
				'SELECT id, name, uuid FROM nodes WHERE id=$id',
				{ $id: 2 },
				(err, row) => {
					if (!err) {
						expect(row).toEqual({
							id: 2,
							name: 'node2',
							uuid: 'uuid2'
						});
						done();
					}
				}
			);
		});
	});

	test('Updating a node should return the new node by calling getNode', done => {
		const customConn = {
			...conn,
			getNode: jest.fn().mockReturnValue({ mocked: true })
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(resp => {
			expect(resp).toEqual({ mocked: true });
			expect(customConn.getNode).toBeCalledTimes(1);
			expect(customConn.getNode).toBeCalledWith(1);
			done();
		});
	});

	test('Updating a node should post a subscription', done => {
		const customConn = {
			...conn,
			getNode: jest.fn().mockReturnValue({ mocked: true })
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: true });
			done();
		});
	});
});

describe('Update node in always-failing database', () => {
	test('db.run will fail', () => {
		const db = {
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(UpdateNode({ db }, 1, { name: 'newName' })).rejects.toBe(
			'DB Error at run'
		);
	});
});
