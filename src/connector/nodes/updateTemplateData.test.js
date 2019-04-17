import SQLite from 'sqlite3';
import { UserInputError } from 'apollo-server';
import populate from '../../sqlite/populate';

import UpdateTemplateData from './updateTemplateData';

describe('Update template data in real database', () => {
	var mockedPublish = null;
	var conn = null;
	beforeEach(done => {
		mockedPublish = jest.fn();
		conn = {
			mqtt: {
				aedes: {
					publish: jest.fn((packet, cb) => cb())
				}
			},
			db: new SQLite.Database(
				':memory:',
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (!error) {
						populate(conn.db, error => {
							if (!error) {
								conn.db.exec('PRAGMA foreign_keys=ON');

								//add sample nodes
								conn.db.exec(
									`INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2");
								INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp"),(1, "thermostat");
								INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep_1_switch_on", 1, "0,1"),
								(1, "ep_1_lamp_on", 1, "0,1"),(1, "ep_1_lamp_r", 1, "0:255"),(1, "ep_1_lamp_g", 1, "0:255"),
								(1, "ep_1_lamp_b", 1, "0:255"),(1, "ep_1_lamp_dim", 1, "0:255"),
								(1, "ep_1_thermostat_temperature", 0, "-30:70");
								INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1),
								(2, "on", 2),(2, "r", 3),(2, "g", 4),(2, "b", 5),(2, "dim", 6),(3, "temperature", 7);`,
									error => {
										if (!error) {
											done();
										}
									}
								);
							}
						});
					}
				}
			),
			nodeSubscription: () => ({
				publish: mockedPublish
			}),
			getNode: jest.fn().mockReturnValue({ mocked: 'user' })
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

	test('Should resolve to null if node does not exist', () => {
		const customConn = {
			...conn,
			getMapping: jest
				.fn()
				.mockReturnValue(Promise.resolve('nodes/uuid1/ep_1_switch_on'))
		};
		expect(UpdateTemplateData(customConn, 400, { on: false })).resolves.toBe(
			null
		);
	});

	test('Should resolve to the id and name of the template on success', () => {
		const customConn = {
			...conn,
			getMapping: jest
				.fn()
				.mockReturnValue(Promise.resolve('nodes/uuid1/ep_1_switch_on'))
		};
		expect(UpdateTemplateData(customConn, 1, { on: true })).resolves.toEqual({
			id: 1,
			name: 'switch'
		});
	});

	test('Should call getMapping to get mappings', done => {
		const customConn = {
			...conn,
			getMapping: jest.fn().mockReturnValue(Promise.resolve('mock'))
		};
		UpdateTemplateData(customConn, 2, {
			on: true,
			r: 200,
			g: 200,
			b: 200,
			dim: 200
		}).then(() => {
			expect(customConn.getMapping).toBeCalledTimes(5);
			expect(customConn.getMapping).nthCalledWith(1, 'uuid1', 2, 'on');
			expect(customConn.getMapping).nthCalledWith(2, 'uuid1', 2, 'r');
			expect(customConn.getMapping).nthCalledWith(3, 'uuid1', 2, 'g');
			expect(customConn.getMapping).nthCalledWith(4, 'uuid1', 2, 'b');
			expect(customConn.getMapping).nthCalledWith(5, 'uuid1', 2, 'dim');
			done();
		});
	});

	describe('Should publish to mqtt', () => {
		const tests = [
			{
				__ext: {
					name: 'switch'
				},
				input: {
					id: 1,
					options: {
						on: true
					}
				},
				expect: {
					'mock/uuid1/1/on': '1'
				}
			},
			{
				__ext: {
					name: 'lamp'
				},
				input: {
					id: 2,
					options: {
						on: false,
						r: 200,
						g: 150,
						b: 250,
						dim: 100
					}
				},
				expect: {
					'mock/uuid1/2/on': '0',
					'mock/uuid1/2/r': '200',
					'mock/uuid1/2/g': '150',
					'mock/uuid1/2/b': '250',
					'mock/uuid1/2/dim': '100'
				}
			}
		];
		tests.forEach(testCase => {
			test(
				'Should publish to mqtt for ' + testCase.__ext.name + ' templates',
				done => {
					const customConn = {
						...conn,
						getMapping: jest.fn((nodeUUID, templateID, mapping) =>
							Promise.resolve(
								'mock/' + nodeUUID + '/' + templateID + '/' + mapping
							)
						)
					};
					UpdateTemplateData(
						customConn,
						testCase.input.id,
						testCase.input.options
					).then(() => {
						//to be called for every expected publish
						expect(customConn.mqtt.aedes.publish).toBeCalledTimes(
							Object.keys(testCase.expect).length
						);
						for (let i = 0; i < Object.keys(testCase.expect).length; i++) {
							//expect to be called with a packet object
							expect(customConn.mqtt.aedes.publish).nthCalledWith(
								i + 1,
								expect.objectContaining({
									topic: expect.any(String),
									payload: expect.any(String)
								}),
								expect.any(Function)
							);
							//check what is posted to mqtt
							expect(
								customConn.mqtt.aedes.publish.mock.calls[i][0].payload
							).toBe(
								testCase.expect[
									customConn.mqtt.aedes.publish.mock.calls[i][0].topic
								]
							);
						}
						done();
					});
				}
			);
		});
	});

	test('Should reject with UserInputError if endpoint does not exist', done => {
		const customConn = {
			...conn,
			getMapping: jest.fn().mockReturnValue(Promise.resolve('mock'))
		};
		UpdateTemplateData(customConn, 1, { notExistingEndpoint: true }).then(
			() => {},
			err => {
				expect(err).toEqual(expect.any(UserInputError));
				expect(err.message).toBe(
					'Endpoint notExistingEndpoint not available for template'
				);
				done();
			}
		);
	});

	test('Should reject with UserInputError if endpoint not an output', done => {
		const customConn = {
			...conn,
			getMapping: jest.fn().mockReturnValue(Promise.resolve('mock'))
		};
		const resolves = jest.fn();
		UpdateTemplateData(customConn, 3, { temperature: 13 }).then(
			resolves,
			err => {
				expect(resolves).not.toBeCalled();
				expect(err).toEqual(expect.any(UserInputError));
				expect(err.message).toBe(
					'Pin for mapping temperature not an output pin'
				);
				done();
			}
		);
	});

	test('Should reject with UserInputError if data not in range', done => {
		const customConn = {
			...conn,
			getMapping: jest.fn().mockReturnValue(Promise.resolve('mock'))
		};
		const resolves = jest.fn();
		UpdateTemplateData(customConn, 1, { on: 400 }).then(resolves, err => {
			expect(resolves).not.toBeCalled();
			expect(err).toEqual(expect.any(UserInputError));
			expect(err.message).toBe('Value 400 not in range (0,1) for on');
			done();
		});
	});

	test('Should post subscription', done => {
		const customConn = {
			...conn,
			getMapping: jest
				.fn()
				.mockReturnValue(Promise.resolve('nodes/uuid1/ep_1_switch_on'))
		};
		UpdateTemplateData(customConn, 1, { on: true }).then(() => {
			expect(mockedPublish).toBeCalledTimes(1);
			expect(mockedPublish).toBeCalledWith('UPDATED', { mocked: 'user' });
			done();
		});
	});
});

describe('Update node template in always failing database', () => {
	test('1st db.get will fail', () => {
		const db = {
			get: jest.fn((sql, props, cb) => cb('DB Error at 1st get'))
		};
		expect(UpdateTemplateData({ db }, 1, { on: true })).rejects.toBe(
			'DB Error at 1st get'
		);
	});

	test('2nd db.get will fail', () => {
		const db = {
			get: jest
				.fn()
				.mockImplementationOnce((sql, props, cb) =>
					cb(null, { uuid: 'uuid1', id: 1, name: 'switch' })
				)
				.mockImplementationOnce((sql, props, cb) => cb('DB Error at 2nd get'))
		};
		expect(UpdateTemplateData({ db }, 1, { on: true })).rejects.toBe(
			'DB Error at 2nd get'
		);
	});
});
