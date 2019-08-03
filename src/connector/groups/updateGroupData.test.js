import db from '../../sqlite';

import UpdateGroupData from './updateGroupData';

describe('Update group data using real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			mockedPublish = jest.fn();
			conn = {
				db,
				groupSubscription: () => ({
					publish: mockedPublish
				}),
				updateTemplateData: jest
					.fn()
					.mockResolvedValue({ id: 0, name: 'mockedTemplate' }),
				getGroup: jest.fn().mockReturnValue({ mocked: 'group' })
			};

			return db.exec(`INSERT INTO nodes (uuid) VALUES ("node1"),("node2");
							INSERT INTO node_endpoints (node, name) VALUES (1, "sw1"),(1, "sw2"),(2, "on"),(2, "r"),(2, "g"),(2, "b"),(2, "dim");
							INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "switch"),(2, "lamp");
							INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1),(2, "on", 2),(3, "on", 3),(3, "r", 4),(3, "g", 5),(3, "b", 6),(3, "dim", 7);
							INSERT INTO groups (name) VALUES ("group1"),("group2");
							INSERT INTO group_members (pgroup, node) VALUES (1, 1),(1, 2),(2, 2);`);
		})
	);
	afterEach(() => db.close(false));

	test('Should update group data', () => {
		expect(
			UpdateGroupData(conn, 1, [{ name: 'on', value: 1 }])
		).resolves.toEqual({ mocked: 'group' });
	});

	test('Should post subsription', done => {
		UpdateGroupData(conn, 1, [{ name: 'on', value: 1 }]).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: 'group' });
			done();
		});
	});

	test('Should call updateTemplateData for node template it has', done => {
		UpdateGroupData(conn, 1, [{ name: 'on', value: 1 }]).then(() => {
			expect(conn.updateTemplateData).toBeCalledTimes(3);
			expect(conn.updateTemplateData).nthCalledWith(1, 1, { on: 1 });
			expect(conn.updateTemplateData).nthCalledWith(2, 2, { on: 1 });
			expect(conn.updateTemplateData).nthCalledWith(3, 3, { on: 1 });
			done();
		});
	});

	test('Should reject if error happened inside updateTemplateData', () => {
		const customConn = {
			...conn,
			updateTemplateData: jest
				.fn()
				.mockReturnValue(
					new Promise((resolve, reject) =>
						setTimeout(() => reject('Error inside updateTemplateData'), 500)
					)
				)
		};
		expect(
			UpdateGroupData(customConn, 1, [{ name: 'on', value: 1 }])
		).rejects.toBe('Error inside updateTemplateData');
	});
});

describe('Update group data using always failing database', () => {
	test('db.all will fail', () => {
		const db = {
			all: jest.fn(() => Promise.reject('DB Error at all'))
		};
		expect(UpdateGroupData({ db }, 1, [{ name: 'on', value: 1 }])).rejects.toBe(
			'DB Error at all'
		);
	});
});
