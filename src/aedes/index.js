import Aedes from 'aedes';
import net from 'net';
import MQTTStore from 'mqtt-store';

import connector from '../connector';

import authenticate from './authenticate';
import * as authorize from './authorize';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedas/index
 * @summary It provides authentication and authorization functions.
 */

const aedes = new Aedes();
const server = net.createServer(aedes.handle);

//create store aedes server
const store = new MQTTStore();

//subscribe store for all the changes
aedes.on('publish', (packet, client) => {
	//publish to subscription
	connector.nodeSubscription().mqttTrigger(packet.topic, client);

	//sync store
	store.put(packet.topic, packet.payload.toString('utf-8'));
});

aedes.authenticate = authenticate;

aedes.authorizePublish = authorize.publish;
aedes.authorizeSubscribe = authorize.subscribe;

export { aedes, store };
export default server;
