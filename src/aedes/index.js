import CustomAedes from './CustomAedes';
import net from 'net';
import MQTTStore from 'mqtt-store';

import connector from '../connector';

/**
 * Creates an Aedes broker instance. Creates a TCP server using and attaches the aedes handle to it.
 * The module also creates an MQTT store and keeps it in sync with the broker. The module also activates
 * the triggers for the connector nodeSubscription.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedes/index
 * @summary MQTT broker setup
 */

/**
 * @typedef {Object} module:aedes/index.MQTTPacket
 * @summary MQTT packet
 * @property {string} [cmd=publish] - Command. Should be publish
 * @property {number} [qos=0] - Quality of service. Can be 0, 1 or 2
 * @property {string} topic - Topic to publish to
 * @property {string|Buffer} payload - Payload to publish (needed when cmd=publish)
 * @property {boolean} [retain=false] - Set if packet is retained
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

export {
	/**
	 * @summary Aedes broker instance
	 * @see module:aedes/CustomAedes
	 */
	aedes,
	/**
	 * @summary MQTT store
	 */
	store
};

/** TCP server instance */
export default server;
