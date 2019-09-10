import MQTTStore from 'mqtt-store';

import GetTopic from './getTopic';

describe('Get Topic value from MQTT store', () => {
	let mqtt;
	beforeEach(() => {
		mqtt = {
			store: new MQTTStore()
		};
		mqtt.store.put('endpoint/1', 'value1');
		mqtt.store.put('endpoint/2', 'value2');
	});
	afterEach(() => {
		mqtt = null;
	});

	test('Get value from endpoint/1', () => {
		expect(GetTopic({ mqtt }, 'endpoint/1')).resolves.toBe('value1');
	});

	test('Get value from endpoint/2', () => {
		expect(GetTopic({ mqtt }, 'endpoint/2')).resolves.toBe('value2');
	});

	test('Not existing endpoint should resolve to null', () => {
		expect(GetTopic({ mqtt }, 'Not/Extisting/Endpoitn')).resolves.toBe(null);
	});
});
