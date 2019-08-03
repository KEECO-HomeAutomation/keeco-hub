import PublishTopic from './publishTopic';

describe('Publish value to aedes', () => {
	test('Should call aedes publish', () => {
		const mqtt = {
			aedes: {
				publish: jest.fn(options => Promise.resolve())
			}
		};
		PublishTopic({ mqtt }, 'topic', 'payload');
		expect(mqtt.aedes.publish).toBeCalledTimes(1);
		expect(mqtt.aedes.publish).toBeCalledWith({
			topic: 'topic',
			payload: 'payload'
		});
	});

	test('Should resolve to an mqtt packet', () => {
		const mqtt = {
			aedes: {
				publish: jest.fn(options => Promise.resolve())
			}
		};
		expect(PublishTopic({ mqtt }, 'topic', 'payload')).resolves.toEqual({
			topic: 'topic',
			payload: 'payload'
		});
	});
});
