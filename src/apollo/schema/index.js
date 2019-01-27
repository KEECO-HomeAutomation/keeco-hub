import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

//import root Query
import Query_types from './Query/schema.graphql';
import Query_resolvers from './Query/resolvers';

//import Users
import Users_types from './Users/schema.graphql';
import Users_resolvers from './Users/resolvers';

export const typeDefs = [Query_types, Users_types];
export const resolvers = merge(Query_resolvers, Users_resolvers);

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export default schema;
