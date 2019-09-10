import db from '../../sqlite';

import UpdateGroup from './updateGroup';

describe('Update group in real database', () => {
	let mockedPublish = null;
	let conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				groupSubscription: () => ({
					publish: mockedPublish
				}),
				getGroup: jest.fn().mockReturnValue({ mocked: 'group' })
			};

			return db.exec('INSERT INTO groups (name) VALUES ("group1"),("group2")');
		})
	);
	afterEach(() => db.close(false));

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
			conn.db.all('SELECT id, name, is_room FROM groups').then(rows => {
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
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(
			UpdateGroup({ db }, 1, { name: 'newName', is_room: 1 })
		).rejects.toBe('DB Error at get');
	});

	test('db.run will fail', () => {
		const db = {
			get: jest.fn(() => Promise.resolve({ count: 1 })),
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(
			UpdateGroup({ db }, 1, { name: 'newName', is_room: 1 })
		).rejects.toBe('DB Error at run');
	});
});
