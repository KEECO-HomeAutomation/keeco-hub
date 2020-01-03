import db from '../../sqlite';

import GetNodesByTemplate from './getNodesByTemplate';

describe('Get nodes by template from real database', () => {
	beforeEach(() =>
		db.initTest().then(() => {
			return db.exec(`INSERT INTO nodes (uuid, name) VALUES ('uuid1', 'node1'), ('uuid2', 'node2'), ('uuid3', 'node3');
							INSERT INTO node_templates (node, name) VALUES (1, 'switch'), (2, 'switch'), (3, 'switch'),
							(1, 'lamp'), (2, 'lamp'), (3, 'thermostat');`);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to empty array if no node found for that template', () => {
		expect(
			GetNodesByTemplate({ db }, 'NotExistingTemplateName')
		).resolves.toEqual([]);
	});

	describe('Should get the appropiate nodes', () => {
		const tests = [
			{
				input: 'switch',
				expect: [
					{
						id: 1,
						name: 'node1',
						uuid: 'uuid1'
					},
					{
						id: 2,
						name: 'node2',
						uuid: 'uuid2'
					},
					{
						id: 3,
						name: 'node3',
						uuid: 'uuid3'
					}
				]
			},
			{
				input: 'lamp',
				expect: [
					{
						id: 1,
						name: 'node1',
						uuid: 'uuid1'
					},
					{
						id: 2,
						name: 'node2',
						uuid: 'uuid2'
					}
				]
			},
			{
				input: 'thermostat',
				expect: [
					{
						id: 3,
						name: 'node3',
						uuid: 'uuid3'
					}
				]
			}
		];
		tests.forEach(testCase => {
			test('Should get all the ' + testCase.input + '(e)s', () => {
				expect(GetNodesByTemplate({ db }, testCase.input)).resolves.toEqual(
					testCase.expect
				);
			});
		});
	});
});

describe('Get nodes by template from always-failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(GetNodesByTemplate({ db }, 'switch')).rejects.toBe(
			'DB Error at all'
		);
	});
});
