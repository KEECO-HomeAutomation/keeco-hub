import db from '../../sqlite';

import CreateGroup from './createGroup';

describe('Create group in real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				groupSubscription: () => ({
					publish: mockedPublish
				})
			};
		})
	);
	afterEach(() => db.close(false));

	test('Should add group and resolve to it', () => {
		expect(
			CreateGroup(conn, { name: 'group', is_room: false })
		).resolves.toEqual({ id: 1, name: 'group', is_room: false });
	});

	test('Should add group to database', done => {
		CreateGroup(conn, { name: 'group', is_room: false }).then(() => {
			conn.db.all('SELECT id, name, is_room FROM groups').then(rows => {
				expect(rows.length).toBe(1);
				expect(rows[0]).toEqual({ id: 1, name: 'group', is_room: 0 });
				done();
			});
		});
	});

	test('Should call subscription', done => {
		CreateGroup(conn, { name: 'group', is_room: false }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('CREATED', {
				id: 1,
				name: 'group',
				is_room: false
			});
			done();
		});
	});
});

describe('Create group in always failing database', () => {
	test('db.run will fail', () => {
		const db = {
			run: jest.fn(() => Promise.reject('DB Error at run'))
		};
		expect(CreateGroup({ db }, { name: 'group', is_room: false })).rejects.toBe(
			'DB Error at run'
		);
	});
});
