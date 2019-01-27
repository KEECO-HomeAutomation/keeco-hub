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
	},
	Mutation: {
		createUser: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				let user = await ctx.connector.createUser(args.input);
				if (!user) {
					throw new ApolloError('Username already taken', 'GENERIC');
				} else {
					return user;
				}
			}
		},
		updateUser: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				return ctx.connector.updateUser(args.id, args.input);
			}
		},
		deleteUser: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			} else {
				if (ctx.user.uid == args.id) {
					throw new ApolloError('You can not delete yourself', 'GENERIC');
				} else {
					return ctx.connector.deleteUser(args.id);
				}
			}
		}
	}
};

export default resolvers;
