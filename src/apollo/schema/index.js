import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

//import root Query
import Query_types from './Query/schema.graphql';
import Query_resolvers from './Query/resolvers';

//import Test1
import Test1_types from './Test1/schema.graphql';
import Test1_resolvers from './Test1/resolvers';

//import Test1
import Test2_types from './Test2/schema.graphql';
import Test2_resolvers from './Test2/resolvers';

export const typeDefs = [Query_types, Test1_types, Test2_types];
export const resolvers = merge(
	Query_resolvers,
	Test1_resolvers,
	Test2_resolvers
);

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});
export default schema;
