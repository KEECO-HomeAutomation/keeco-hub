import { AuthenticationError, ApolloError } from 'apollo-server';

const resolvers = {
	Query: {
		nodes: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getNodes();
		},
		getNode: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getNode(args.id);
		},
		getMapping: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getMapping(
				args.nodeUUID,
				args.templateID,
				args.mapping
			);
		},
		getNodesByTemplate: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getNodesByTemplate(args.template);
		}
	},
	Mutation: {
		updateNode: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.updateNode(args.id, args.input);
		},
		updateTemplateData: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			let update = await ctx.connector.updateTemplateData(args.id, args.input);
			if (update) {
				return update;
			}
		},
		deleteNode: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.deleteNode(args.id);
		}
	},
	Node: {
		endpoints: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getEndpoints(parent.id, parent.uuid);
		},
		templates: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getTemplates(parent.id);
		}
	},
	Template: {
		data: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getTemplateData(parent.id, parent.name);
		},
		mappings: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getTemplateMappings(parent.id);
		}
	},
	TemplateData: {
		__resolveType: parent => {
			return (
				'TemplateData' +
				parent.id
					.split('_')[2]
					.charAt(0)
					.toUpperCase() +
				parent.id.split('_')[2].slice(1)
			);
		}
	},
	Mapping: {
		endpoint: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getEndpointForMapping(parent.id);
		}
	},
	Subscription: {
		nodeSubscription: {
			subscribe: (parent, args, ctx) => {
				if (!ctx.user) {
					throw new AuthenticationError();
				}

				return ctx.connector.nodeSubscription().subscribe();
			}
		}
	}
};

export default resolvers;
