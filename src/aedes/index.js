import CustomAedes from './CustomAedes';
import net from 'net';
import MQTTStore from 'mqtt-store';

import connector from '../connector';

const aedes = new CustomAedes();
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

export { aedes, store };
export default server;
