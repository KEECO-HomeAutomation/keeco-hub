import PublishTopic from './publishTopic';

describe('Publish value to aedes', () => {
	test('Should call aedes publish', () => {
		const mqtt = {
			aedes: {
				publish: jest.fn((options, cb) => cb())
			}
		};
		PublishTopic({ mqtt }, 'topic', 'payload');
		expect(mqtt.aedes.publish).toBeCalledTimes(1);
		expect(mqtt.aedes.publish).toBeCalledWith(
			{
				topic: 'topic',
				payload: 'payload'
			},
			expect.any(Function)
		);
	});

	test('Should resolve to an mqtt packet', () => {
		const mqtt = {
			aedes: {
				publish: jest.fn((options, cb) => cb())
			}
		};
		expect(PublishTopic({ mqtt }, 'topic', 'payload')).resolves.toEqual({
			topic: 'topic',
			payload: 'payload'
		});
	});
});
