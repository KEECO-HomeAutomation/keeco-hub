import { ApolloServer } from 'apollo-server';

import schema from './schema';

const server = new ApolloServer({
	schema,
	context: ({ req }) => {
		req.user = 'tomika';
	}
});

export default server;
