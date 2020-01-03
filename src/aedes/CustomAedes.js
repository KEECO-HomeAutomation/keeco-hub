import Aedes from 'aedes';

import authenticate from './authenticate';
import * as authorize from './authorize';

/**
 * @author Gergő Fándly <gegro@systemtest.tk
 * @module aedes/CustomAedes
 * @summary Modified Aedes broker to support promises
 */

class CustomAedes extends Aedes {
	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @summary Aedes broker modified to use promises and custom handles
	 */
	constructor() {
		super();

		this.authenticate = authenticate;
		this.authorizePublish = authorize.publish;
		this.authorizeSubscribe = authorize.subscribe;
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @summary Publish a packet
	 * @param {module:aedes/index.MQTTPacket} packet - Packet to publish
	 * @returns {Promise} Empty promise that resolves when packet published
	 */
	publish(packet) {
		return new Promise(resolve => {
			super.publish(packet, resolve);
		});
	}

	/**
	 * @callback subscribeCallback
	 * @summary Called when a publish happens on a subscribed topic
	 * @param {module:aedes/index.MQTTPacket} packet - Packet containing cmd, qos, topic, payload (buffer) and retain
	 * @param {function} cb - Function that must be called after receiving the packet
	 */
	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @summary Subscribe to a topic
	 * @param {string} topic - The topic to subscribe to
	 * @param {subscribeCallback} func - Function to call when packet published
	 * @returns {Promise} Empty promise that resolves when subscribe suceeded
	 */
	subscribe(topic, func) {
		return new Promise(resolve => {
			super.subscribe(topic, func, resolve);
		});
	}
}

/** CustomAedes class */
export default CustomAedes;
