import { ApolloServer, PubSub } from 'apollo-server';

import schema from './schema';

import connector from '../connector';

const pubsub = new PubSub();

const server = new ApolloServer({
	schema,
	context: async ({ req, wsConnection }) => {
		let token;
		if (wsConnection) {
			// ws connection
			token = wsConnection.context.Authorization || '';
		} else {
			// http connection
			token = req.headers.authorization || '';
		}

		const user = await connector.authenticate(token);
		return { connector, user, pubsub };
	}
});

export { pubsub };
export default server;
