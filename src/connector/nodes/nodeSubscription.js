const nodeSubscription = conn => ({
	subscribe: () => {
		return new Promise(resolve => {
			resolve(conn.gql.pubsub.asyncIterator(['node']));
		});
	},
	publish: (type, node) => {
		if (node !== null && ['CREATED', 'UPDATED', 'DELETED'].includes(type)) {
			conn.gql.pubsub.publish('node', {
				nodeSubscription: {
					mutation: type,
					node: node
				}
			});
		}
	},
	mqttTrigger(topic, client) {
		return new Promise(resolve => {
			//client is null for internal messages and messages sent from server
			if (client !== null && topic.match(/^nodes\/.*\/.*/)) {
				//we have something published by a node
				const uuid = topic.split('/')[1];
				conn.db
					.get('SELECT COUNT(id) AS count, id FROM nodes WHERE uuid=$uuid', {
						$uuid: uuid
					})
					.then(row => {
						if (row.count !== 0) {
							this.publish('UPDATED', conn.getNode(row.id));
						}
						resolve();
					});
			} else {
				resolve();
			}
		});
	}
});

export default nodeSubscription;
