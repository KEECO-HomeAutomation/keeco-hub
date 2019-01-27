import { AuthenticationError, ApolloError } from 'apollo-server';

const resolvers = {
	Query: {
		users: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				return ctx.connector.getUsers();
			}
		},
		getUser: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				let user = await ctx.connector.getUser(args.id);
				if (!user) {
					throw new ApolloError('ID not found', 'ENOENT');
				} else {
					return user;
				}
			}
		}
	},
	User: {
		sessions: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				return ctx.connector.getSessions(parent.id);
			}
		}
	}
};

export default resolvers;
