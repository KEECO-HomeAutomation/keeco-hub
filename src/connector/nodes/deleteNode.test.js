import db from '../../sqlite';

import DeleteNode from './deleteNode';

describe('Delete node from real database', () => {
	var mockedPublish = null;
	var conn = null;
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
				'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "node1"),("uuid2", "node2")'
			);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve with an object containing id if delete successful', () => {
		expect(DeleteNode(conn, 1)).resolves.toEqual({ id: 1 });
	});

	test('Should delete the node from the database', done => {
		DeleteNode(conn, 1).then(() => {
			conn.db
				.get('SELECT COUNT(id) AS count FROM nodes WHERE id=$id', { $id: 1 })
				.then(row => {
					expect(row.count).toBe(0);
					done();
				});
		});
	});

	test('Should not hurt any other node the deletion of one node', done => {
		DeleteNode(conn, 1).then(() => {
			conn.db
				.get('SELECT COUNT(id) AS count FROM nodes WHERE id=$id', { $id: 2 })
				.then(row => {
					expect(row.count).toBe(1);
					done();
				});
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
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(DeleteNode({ db }, 1)).rejects.toBe('DB Error at get');
	});

	test('db.get will pass, db.run will fail', () => {
		const db = {
			get: jest.fn(() =>
				Promise.resolve({ count: 1, uuid: 'uuid1', name: 'node1' })
			),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(DeleteNode({ db }, 1)).rejects.toBe('DB Error at run');
	});
});
