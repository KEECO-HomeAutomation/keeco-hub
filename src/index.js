import gqlServer, { pubsub } from './apollo';
import mqttServer, { aedes, store } from './aedes';
import db from './sqlite';
import connector from './connector';
import mdns from './mdns';

import { log } from './utils';
import ports from './utils/ports.config';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module index
 * @summary Handle the start and the shutdown of the webserver.
 */

log('HUB', 'Keeco-hub is starting up', 'message');

gqlServer.listen(ports.gqlServerPort).then(() => {
	log(
		'Apollo',
		'GraphQL server started at port ' + ports.gqlServerPort,
		'message'
	);
});

mqttServer.listen(ports.mqttServerPort, () => {
	log(
		'Aedes',
		'MQTT server started at port ' + ports.mqttServerPort,
		'message'
	);
});

db.init('database.sqlite').then(
	() => {
		log('SQLite', 'Database successfully opened', 'message');
	},
	() => {
		close();
	}
);

connector
	.init({
		db: db,
		mqtt: { aedes, store },
		gql: { gqlServer, pubsub }
	})
	.then(() => {
		log('Connector', 'Connector successfully set up', 'message');
	});

mdns.init(() => {
	log('MDNS', 'MDNS started answering', 'message');
});

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function close
 * @summary Close down the webserver. Before the shutdown, remove its listeners and disconnect from the database.
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
process.on('SIGTERM', close);
process.on('SIGUSR1', close);
process.on('SIGUSR2', close);
