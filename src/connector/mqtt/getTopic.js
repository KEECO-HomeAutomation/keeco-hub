const getTopic = (conn, topic) => {
	return Promise.resovle(conn.mqtt.store.get(topic).value);
};

export default getTopic;
