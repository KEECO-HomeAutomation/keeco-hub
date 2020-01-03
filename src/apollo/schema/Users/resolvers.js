import { AuthenticationError, ApolloError } from 'apollo-server';

const resolvers = {
	Query: {
		users: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getUsers();
		},
		getUser: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getUser(args.id);
		}
	},
	User: {
		sessions: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getSessions(parent.id);
		}
	},
	Mutation: {
		createUser: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			const user = await ctx.connector.createUser(args.input);
			if (!user) {
				throw new ApolloError('Username already taken', 'GENERIC');
			} else {
				return user;
			}
		},
		updateUser: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.updateUser(args.id, args.input);
		},
		deleteUser: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			if (ctx.user.uid == args.id) {
				throw new ApolloError('You can not delete yourself', 'GENERIC');
			} else {
				return ctx.connector.deleteUser(args.id);
			}
		}
	},
	Subscription: {
		userSubscription: {
			subscribe: (parent, args, ctx) => {
				if (!ctx.user) {
					throw new AuthenticationError();
				}

				return ctx.connector.userSubscription().subscribe();
			}
		}
	}
};

export default resolvers;
