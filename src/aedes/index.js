import CustomAedes from './CustomAedes';
import net from 'net';
import MQTTStore from 'mqtt-store';

import connector from '../connector';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedas/index
 * @summary Provide authentication and authorization functions.
 */

const aedes = new CustomAedes();
const server = net.createServer(aedes.handle);

// Create store aedes server.
const store = new MQTTStore();

// Subscribe store for all the changes.
aedes.on('publish', (packet, client) => {
	// Publish to subscription.
	connector.nodeSubscription().mqttTrigger(packet.topic, client);

	// Sync store.
	store.put(packet.topic, packet.payload.toString('utf-8'));
});

export { aedes, store };
export default server;
