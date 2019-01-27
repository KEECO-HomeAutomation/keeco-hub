import gqlServer from './apollo';
import mqttServer from './aedes';
import db, { initDB } from './sqlite';

import { log } from './utils';

log('HUB', 'Keeco-hub is starting up', 'message');

gqlServer.listen(5000).then(() => {
	log('Apollo', 'GraphQL server started at port 5000', 'message');
});

mqttServer.listen(1883, () => {
	log('Aedes', 'MQTT server started at port 1883', 'message');
});

initDB('database.sqlite', () => {
	log('SQLite', 'Database successfully opened', 'message');
});
