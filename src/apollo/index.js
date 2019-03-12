import { ApolloServer, PubSub } from 'apollo-server';

import schema from './schema';

import connector from '../connector';

const pubsub = new PubSub();

const server = new ApolloServer({
	schema,
	context: async ({ req, connection }) => {
		let token;
		if (connection) {
			//we have a ws connection
			token = connection.context.Authorization || '';
		} else {
			//we have a http connection
			token = req.headers.authorization || '';
		}

		let user = await connector.authenticate(token);
		return { connector, user, pubsub };
	}
});

export { pubsub };
export default server;
