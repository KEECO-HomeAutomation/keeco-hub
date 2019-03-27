const userSubscription = conn => ({
	subscribe: () => {
		return new Promise(resolve => {
			resolve(conn.gql.pubsub.asyncIterator(['user']));
		});
	},
	publish: (type, user) => {
		console.log(user);
		if (user!==null) {
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
