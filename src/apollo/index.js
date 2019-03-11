import { ApolloServer, PubSub } from 'apollo-server';

import schema from './schema';

import connector from '../connector';

const pubsub = new PubSub();

const server = new ApolloServer({
	schema,
	context: async ({ req }) => {
		let token = req.headers.authorization || '';
		let user = await connector.authenticate(token);
		return { connector, user, pubsub };
	}
});

export { pubsub };
export default server;
