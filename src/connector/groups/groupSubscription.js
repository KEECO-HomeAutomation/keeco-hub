const groupSubscription = conn => ({
	subscribe: () => {
		return new Promise(resolve => {
			resolve(conn.gql.pubsub.asyncIterator(['group']));
		});
	},
	publish: (type, group) => {
		if (group !== null && ['CREATED', 'UPDATED', 'DELETED'].includes(type)) {
			conn.gql.pubsub.publish('group', {
				groupSubscription: {
					mutation: type,
					node: group
				}
			});
		}
	}
});

export default groupSubscription;
