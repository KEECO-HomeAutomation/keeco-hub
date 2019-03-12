const subscribeTopic = (conn, topic) => {
	return new Promise(resolve => {
		conn.mqtt.aedes.subscribe(
			topic,
			(packet, cb) => {
				conn.gql.pubsub.publish('mqtt_' + topic, {
					subscribeTopic: {
						topic: packet.topic,
						payload: packet.payload
					}
				});
			},
			() => {
				resolve(conn.pubsub.asyncIterator(['mqtt_' + topic]));
			}
		);
	});
};

export default subscribeTopic;
