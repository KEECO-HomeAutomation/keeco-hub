const getTopic = (conn, topic) => {
	return Promise.resolve(conn.mqtt.store.get(topic).value);
};

export default getTopic;
