import { AuthenticationError } from 'apollo-server';

const resolvers = {
	Query: {
		getTopic: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getTopic(args.topic);
		}
	},
	Mutation: {
		publishTopic: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.publishTopic(args.topic, args.payload);
		}
	},
	Subscription: {
		subscribeTopic: {
			subscribe: (parent, args, ctx) => {
				if (!ctx.user) {
					throw new AuthenticationError();
				}

				return ctx.connector.subscribeTopic(args.topic);
			}
		}
	}
};

export default resolvers;
