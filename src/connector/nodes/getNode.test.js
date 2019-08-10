import db from '../../sqlite';

import GetNode from './getNode';

describe('Get node from real database', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('Should get node with id=1', done => {
		db.exec('INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1")').then(
			() => {
				expect(GetNode({ db }, 1)).resolves.toEqual({
					id: 1,
					uuid: 'uuid1',
					name: 'name1'
				});
				done();
			}
		);
	});

	test('Should get node with id=1 even if multiple nodes are present', done => {
		db.exec(
			'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")'
		).then(() => {
			expect(GetNode({ db }, 1)).resolves.toEqual({
				id: 1,
				uuid: 'uuid1',
				name: 'name1'
			});
			done();
		});
	});

	test('Should return null if id not found', () => {
		expect(GetNode({ db }, 400)).resolves.toBe(null);
	});
});

describe('Get node from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};

		expect(GetNode({ db }, 400)).rejects.toBe('DB Error at get');
	});
});
