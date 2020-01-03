const publishTopic = (conn, topic, payload) => {
	return new Promise(resolve => {
		conn.mqtt.aedes
			.publish({
				topic: topic,
				payload: payload
			})
			.then(() => {
				resolve({
					topic: topic,
					payload: payload
				});
			});
	});
};

export default publishTopic;
