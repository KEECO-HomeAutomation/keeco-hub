import db from '../../sqlite';

import GetTemplates from './getTemplates';

describe('Get templates from real database', () => {
	beforeEach(() =>
		db.initTest().then(() => {
			return db.exec(`INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2");
							INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp"),(1, "thermostat");`);
		})
	);
	afterEach(() => db.close(false));

	test('Should return an empty array if node does not exist', () => {
		expect(GetTemplates({ db }, 400)).resolves.toEqual([]);
	});

	test('Should return an empty array if no templates available', () => {
		expect(GetTemplates({ db }, 2)).resolves.toEqual([]);
	});

	test('Should return an array of templates', () => {
		expect(GetTemplates({ db }, 1)).resolves.toEqual([
			{
				id: 1,
				name: 'switch'
			},
			{
				id: 2,
				name: 'lamp'
			},
			{
				id: 3,
				name: 'thermostat'
			}
		]);
	});
});

describe('Get templates from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetTemplates({ db }, 1)).rejects.toBe('DB Error at all');
	});
});
