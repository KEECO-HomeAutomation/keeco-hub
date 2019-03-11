import Aedes from 'aedes';
import net from 'net';
import MQTTStore from 'mqtt-store';

import authenticate from './authenticate';
import * as authorize from './authorize';

const aedes = new Aedes();
const server = net.createServer(aedes.handle);

//create store aedes server
const store = new MQTTStore();

//subscribe store for all the changes
aedes.on('publish', packet => {
	store.put(packet.topic, packet.payload.toString('utf-8'));
});

//set authentication function
aedes.authenticate = authenticate;

//set authorization functions
aedes.authorizePublish = authorize.publish;
aedes.authorizeSubscribe = authorize.subscribe;

export { aedes, store };
export default server;
