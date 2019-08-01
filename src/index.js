import gqlServer, { pubsub } from './apollo';
import mqttServer, { aedes, store } from './aedes';
import db from './sqlite';
import connector from './connector';
import mdns from './mdns';

import { log } from './utils';
import ports from './utils/ports.config';

log('HUB', 'Keeco-hub is starting up', 'message');

gqlServer.listen(ports.gqlServer).then(() => {
	log('Apollo', 'GraphQL server started at port ' + ports.gqlServer, 'message');
});

mqttServer.listen(ports.mqttServer, () => {
	log('Aedes', 'MQTT server started at port ' + ports.mqttServer, 'message');
});

db.init('database.sqlite', () => {
	log('SQLite', 'Database successfully opened', 'message');
});

connector.init(
	{
		db: db,
		mqtt: { aedes, store },
		gql: { gqlServer, pubsub }
	},
	() => {
		log('Connector', 'Connector successfully set up', 'message');
	}
);

mdns.init(() => {
	log('MDNS', 'MDNS started answering', 'message');
});

/**
 * @function close
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @summary Closes down the webserver. Before the shutdown, it removes its listeners and disconnects from the database.
 */
const close = () => {
	process.removeAllListeners();

	log('HUB', 'Shutting down', 'message');

	db.close().then(
		() => {
			log('HUB', 'Successfully shut down', 'message');
			process.exit();
		},
		() => {
			log('HUB', 'Error during shutdown', 'error');
		}
	);
};

process.on('exit', close);
process.on('SIGINT', close);
process.on('SIGUSR1', close);
process.on('SIGUSR2', close);
