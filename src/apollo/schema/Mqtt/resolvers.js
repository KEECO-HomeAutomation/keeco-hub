import { AuthenticationError } from 'apollo-server';

const resolvers = {
	Query: {
		getTopic: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return conn.getTopic(args.topic);
		}
	},
	Mutation: {
		publishTopic: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return conn.publishTopic(args.topic, args.payload);
		}
	},
	Subscription: {
		subscribeTopic: (parent, args, ctx) => {
			subscribe: () => {
				conn.
			}
		}
	}
};
