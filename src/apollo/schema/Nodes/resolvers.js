import { AuthenticationError, ApolloError } from 'apollo-server';

const resolvers = {
	Query: {
		nodes: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getNodes();
		},
		getNode: async (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			let node = await ctx.connector.getNode(args.id);
			if (!node) {
				throw new ApolloError('ID not found', 'ENOENT');
			} else {
				return node;
			}
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
	Mapping: {
		endpoint: (parent, args, ctx) => {
			if (!ctx.user) {
				throw new AuthenticationError();
			}

			return ctx.connector.getEndpoint(parent.id);
		}
	}
};

export default resolvers;
