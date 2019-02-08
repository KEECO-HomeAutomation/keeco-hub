import Aedes from 'aedes';
import net from 'net';
import MQTTStore from 'mqtt-store';
import log from '../utils';

const aedes = new Aedes();
const server = net.createServer(aedes.handle);

//create store aedes server
const store = new MQTTStore();

//subscribe store for all the changes
aedes.on('publish', (packet, client) => {
	if (process.env.NODE_ENV === 'development') {
		log(
			'Aedes',
			'Received packet at ' +
				packet.topic +
				'. Payload: ' +
				packet.payload.toString('utf-8')
		);
	}

	store.put(packet.topic, packet.payload.toString('utf-8'));
});

export { aedes, store };
export const publish = aedes.publish;
export const subscribe = aedes.subscribe;
export const unsubscribe = aedes.unsubscribe;
export default server;
