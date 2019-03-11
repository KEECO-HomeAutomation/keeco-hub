import { AuthenticationError } from 'apollo-server';

const resolvers = {
	Query: {
		_: () => true
	},
	Mutation: {
		login: async (parent, args, ctx) => {
			let response = await ctx.connector.login(
				args.input.username,
				args.input.password
			);
			if (!response) {
				throw new AuthenticationError('Wrong username or password');
			} else {
				return response;
			}
		},
		logout: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.logout(ctx.user.token);
		}
	},
	Subscription: {
		_: (parent, args, ctx) => {
			subscribe: () => {
				return pubsub.asyncIterator(['_']);
			};
		}
	}
};

export default resolvers;
