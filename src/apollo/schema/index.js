import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

//import root Query
import Query_types from './Query/schema.graphql';
import Query_resolvers from './Query/resolvers';

//import Users
import Users_types from './Users/schema.graphql';
import Users_resolvers from './Users/resolvers';

//import Nodes
import Nodes_types from './Nodes/schema.graphql';
import Nodes_resolvers from './Nodes/resolvers';

//import Mqtt
import Mqtt_types from './Mqtt/schema.graphql';
import Mqtt_resolvers from './Mqtt/resolvers';

export const typeDefs = [Query_types, Users_types, Nodes_types, Mqtt_types];
export const resolvers = merge(
	Query_resolvers,
	Users_resolvers,
	Nodes_resolvers,
	Mqtt_resolvers
);

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

export default schema;
