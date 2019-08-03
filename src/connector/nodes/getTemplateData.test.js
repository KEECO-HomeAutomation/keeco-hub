import db from '../../sqlite';
import MQTTStore from 'mqtt-store';

import GetTemplateData from './getTemplateData';

const tests = [
	{
		input: {
			id: 1,
			name: 'switch'
		},
		expect: {
			id: 'uuid1_1_switch_data',
			on: true
		}
	},
	{
		input: {
			id: 2,
			name: 'lamp'
		},
		expect: {
			id: 'uuid1_2_lamp_data',
			on: false,
			r: 230,
			g: 200,
			b: 0,
			dim: 100
		}
	},
	{
		input: {
			id: 3,
			name: 'thermostat'
		},
		expect: {
			id: 'uuid1_3_thermostat_data',
			temperature: 23.5
		}
	}
];

describe('Get template data from real database', () => {
	var conn = null;
	beforeEach(() =>
		db.initTest().then(() => {
			conn = {
				db,
				mqtt: { store: new MQTTStore() }
			};
			conn.mqtt.store.put('nodes/uuid1/ep_1_switch_on', 1);
			conn.mqtt.store.put('nodes/uuid1/ep_1_lamp_on', 0);
			conn.mqtt.store.put('nodes/uuid1/ep_1_lamp_r', 230);
			conn.mqtt.store.put('nodes/uuid1/ep_1_lamp_g', 200);
			conn.mqtt.store.put('nodes/uuid1/ep_1_lamp_b', 0);
			conn.mqtt.store.put('nodes/uuid1/ep_1_lamp_dim', 100);
			conn.mqtt.store.put('nodes/uuid1/ep_1_thermostat_temperature', 23.5);

			return db.exec(`INSERT INTO nodes (uuid, name) VALUES ("uuid1", "name1"),("uuid2", "name2");
							INSERT INTO node_templates (node, name) VALUES (1, "switch"),(1, "lamp"),(1, "thermostat");
							INSERT INTO node_endpoints (node, name, output, range) VALUES (1, "ep_1_switch_on", 1, "0,1"),
							(1, "ep_1_lamp_on", 1, "0,1"),(1, "ep_1_lamp_r", 1, "0:255"),(1, "ep_1_lamp_g", 1, "0:255"),
							(1, "ep_1_lamp_b", 1, "0:255"),(1, "ep_1_lamp_dim", 1, "0:255"),
							(1, "ep_1_thermostat_temperature", 0, "-30:70");
							INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES (1, "on", 1),
							(2, "on", 2),(2, "r", 3),(2, "g", 4),(2, "b", 5),(2, "dim", 6),(3, "temperature", 7);`);
		})
	);
	afterEach(() => db.close(false));

	test('Should resolve to null if template does not exist', () => {
		expect(GetTemplateData(conn, 400, 'switch')).resolves.toBe(null);
	});

	test('Should resolve to null if template name is invalid', () => {
		expect(GetTemplateData(conn, 1, 'NotExistingTemplateName')).resolves.toBe(
			null
		);
	});

	describe('Test output types', () => {
		tests.forEach(testCase => {
			test(
				'Template ID=' +
					testCase.input.id +
					' should resolve to a ' +
					testCase.input.name +
					' type',
				done => {
					const customConn = {
						...conn,
						getMapping: jest.fn((nodeUUID, templateID, name) => {
							let map = '';
							switch (templateID) {
								case 1:
									//switch
									map = 'ep_1_switch_' + name;
									break;
								case 2:
									//lamp
									map = 'ep_1_lamp_' + name;
									break;
								case 3:
									//thermostat
									map = 'ep_1_thermostat_' + name;
							}
							return Promise.resolve('nodes/' + nodeUUID + '/' + map);
						})
					};
					GetTemplateData(
						customConn,
						testCase.input.id,
						testCase.input.name
					).then(resp => {
						expect(resp).toEqual(testCase.expect);
						expect(customConn.getMapping).toBeCalledTimes(
							Object.keys(testCase.expect).length - 1
						);
						done();
					});
				}
			);
		});
	});
});

describe('Get template data from always-failing database', () => {
	test('db.get will fail', () => {
		const db = {
			get: jest.fn(() => Promise.reject('DB Error at get'))
		};
		expect(GetTemplateData({ db }, 1, 'switch')).rejects.toBe(
			'DB Error at get'
		);
	});
});
