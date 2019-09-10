import db from '../../sqlite';

import UpdateNode from './updateNode';

describe('Update node in real database', () => {
	let mockedPublish = null;
	let conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				nodeSubscription: () => ({
					publish: mockedPublish
				})
			};

			return db.exec(
				'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "node1"),("uuid2", "node2");'
			);
		})
	);
	afterEach(() => db.close(false));

	test('Should update the database for node1', done => {
		const customConn = {
			...conn,
			getNode: jest.fn()
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(() => {
			conn.db
				.get('SELECT id, name, uuid FROM nodes WHERE id=$id', { $id: 1 })
				.then(row => {
					expect(row).toEqual({
						id: 1,
						name: 'newName',
						uuid: 'uuid1'
					});
					done();
				});
		});
	});

	test('Updating node 1 should not update other nodes', done => {
		const customConn = {
			...conn,
			getNode: jest.fn()
		};
		UpdateNode(customConn, 1, { name: 'newName' }).then(() => {
			conn.db
				.get('SELECT id, name, uuid FROM nodes WHERE id=$id', { $id: 2 })
				.then(row => {
					expect(row).toEqual({
						id: 2,
						name: 'node2',
						uuid: 'uuid2'
					});
					done();
				});
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
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(UpdateNode({ db }, 1, { name: 'newName' })).rejects.toBe(
			'DB Error at run'
		);
	});
});
