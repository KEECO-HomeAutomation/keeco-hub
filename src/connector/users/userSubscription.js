const userSubscription = conn => ({
	subscribe: () => {
		return new Promise(resolve => {
			resolve(conn.gql.pubsub.asyncIterator(['user']));
		});
	},
	publish: (type, user) => {
		if (user !== null && ['CREATED', 'UPDATED', 'DELETED'].includes(type)) {
			conn.gql.pubsub.publish('user', {
				userSubscription: {
					mutation: type,
					node: user
				}
			});
		}
	}
});

export default userSubscription;
