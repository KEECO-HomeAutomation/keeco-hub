import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import CreateGroup from './createGroup';

describe('Create group in real database', () => {
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
								done();
							}
						});
					}
				}
			),
			groupSubscription: () => ({
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

	test('Should add group and resolve to it', () => {
		expect(
			CreateGroup(conn, { name: 'group', is_room: false })
		).resolves.toEqual({ id: 1, name: 'group', is_room: false });
	});

	test('Should add group to database', done => {
		CreateGroup(conn, { name: 'group', is_room: false }).then(() => {
			conn.db.all('SELECT id, name, is_room FROM groups', {}, (err, rows) => {
				expect(err).toBe(null);
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
			run: jest.fn((sql, props, cb) => cb('DB Error at run'))
		};
		expect(CreateGroup({ db }, { name: 'group', is_room: false })).rejects.toBe(
			'DB Error at run'
		);
	});
});
