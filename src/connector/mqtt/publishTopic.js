const publishTopic = (conn, topic, payload) => {
	return new Promise(resolve => {
		conn.mqtt.publish(
			{
				topic: topic,
				payload: payload
			},
			() => {
				resolve({
					topic: topic,
					payload: payload
				});
			}
		);
	});
};

export default publishTopic;
