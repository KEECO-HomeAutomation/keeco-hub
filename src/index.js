import gqlServer from './apollo';
import mqttServer from './aedes';

import { log } from './utils';

log('HUB', 'Keeco-hub is starting up', 'message');

gqlServer.listen(5000).then(({ url }) => {
	log('Apollo', 'GraphQL server started at: ' + url, 'message');
});

mqttServer.listen(1883, () => {
	log('Aedes', 'MQTT server started at port 1883', 'message');
});
