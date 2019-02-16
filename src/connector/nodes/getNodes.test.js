import SQLite from 'sqlite3';
import populate from '../../sqlite/populate';

import GetNodes from './getNodes';

describe('Get nodes from real database', () => {
	var db = null;
	beforeEach(done => {
		db = new SQLite.Database(
			':memory:',
			SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
			error => {
				if (!error) {
					populate(db, error => {
						if (!error) {
							db.exec('PRAGMA foreign_keys=ON');
							done();
						}
					});
				}
			}
		);
	}, 10000);
	afterEach(done => {
		db.close(error => {
			if (!error) {
				db = null;
				done();
			}
		});
	}, 10000);

	test('Should return an array of nodes', done => {
		db.exec(
			'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")',
			error => {
				if (!error) {
					expect(GetNodes({ db })).resolves.toEqual([
						{
							id: 1,
							uuid: 'uuid1',
							name: 'name1'
						},
						{
							id: 2,
							uuid: 'uuid2',
							name: 'name2'
						}
					]);
					done();
				}
			}
		);
	});

	test('Should return an empty array if no nodes', () => {
		expect(GetNodes({ db })).resolves.toEqual([]);
	});
});

describe('Get nodes from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn((sql, props, cb) => cb('DB Error at all'))
		};
		expect(GetNodes({ db })).rejects.toBe('DB Error at all');
	});
});
