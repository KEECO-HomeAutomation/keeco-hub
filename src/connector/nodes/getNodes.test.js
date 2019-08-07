import db from '../../sqlite';

import GetNodes from './getNodes';

describe('Get nodes from real database', () => {
	beforeEach(() => db.initTest());
	afterEach(() => db.close(false));

	test('Should return an array of nodes', done => {
		db.exec(
			'INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2")'
		).then(() => {
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
		});
	});

	test('Should return an empty array if no nodes', () => {
		expect(GetNodes({ db })).resolves.toEqual([]);
	});
});

describe('Get nodes from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetNodes({ db })).rejects.toBe('DB Error at all');
	});
});
