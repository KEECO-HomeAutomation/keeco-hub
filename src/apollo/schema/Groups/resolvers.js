import { AuthenticationError } from 'apollo-server';

const resolvers = {
	Query: {
		groups: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getGroups();
		},
		getGroup: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getGroup(args.id);
		}
	},
	Mutation: {
		createGroup: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.createGroup(args.input);
		},
		updateGroup: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.updateGroup(args.id, args.input);
		},
		updateGroupData: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			const update = await ctx.connector.updateGroupData(
				args.id,
				args.input.data
			);
			if (update) {
				return update;
			}
		},
		addGroupMember: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.addGroupMember(args.id, args.nodeID);
		},
		removeGroupMember: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.removeGroupMember(args.id, args.nodeID);
		},
		deleteGroup: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.deleteGroup(args.id);
		}
	},
	Group: {
		members: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getGroupMembers(parent.id);
		},
		data: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getGroupData(parent.id);
		}
	},
	Subscription: {
		groupSubscription: {
			subscribe: (parent, args, ctx) => {
				if (!ctx.user) {
					throw new AuthenticationError();
				}

				return ctx.connector.groupSubscription().subscribe();
			}
		}
	}
};

export default resolvers;
