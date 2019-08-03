import uuid from 'uuid';

const subscribeTopic = (conn, topic) => {
	return new Promise(resolve => {
		let subUUID = uuid.v4();
		conn.mqtt.aedes
			.subscribe(topic, (packet, cb) => {
				conn.gql.pubsub.publish('mqtt_' + topic + '_' + subUUID, {
					subscribeTopic: {
						topic: packet.topic,
						payload: packet.payload.toString('UTF-8')
					}
				});
				cb();
			})
			.then(() => {
				resolve(
					conn.gql.pubsub.asyncIterator(['mqtt_' + topic + '_' + subUUID])
				);
			});
	});
};

export default subscribeTopic;
