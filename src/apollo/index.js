import { ApolloServer, PubSub } from 'apollo-server';

import schema from './schema';

import connector from '../connector';

const pubsub = new PubSub();

const server = new ApolloServer({
	schema,
	context: async ({ req, wsConnection }) => {
		const token = wsConnection
			? wsConnection.context.Authorization // ws connection
			: req.headers.authorization; // http connection

		if (!token) {
			throw new Error('There is no connection token.');
		}

		const user = await connector.authenticate(token);
		return { connector, user, pubsub };
	}
});

export { pubsub };
export default server;
