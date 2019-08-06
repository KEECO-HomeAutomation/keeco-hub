import { log } from '../utils';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedas/authorize
 */

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function publish
 * @param {*} client
 * @param {*} packet
 * @param {callback} callback - A callback function.
 * @summary Publish to a MQTT topic.
 */
export const publish = (client, packet, callback) => {
	if (!client) {
		//authorize publish from null clients
		callback(null);
		return;
	}

	if (client.uuid == 'development') {
		//authorize development users for everything
		callback(null);
		return;
	}

	if (packet.topic.match(new RegExp('^nodes/' + client.uuid + '/\\S+'))) {
		callback(null);
		return;
	} else {
		log(
			'Aedes',
			'Node ' + client.uuid + ' tried to publish to a topic it does not own',
			'warning'
		);
		callback(new Error('Can publish only to own topic'));
		return;
	}
};

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function subscribe
 * @param {*} client
 * @param {*} sub
 * @param {callback} callback - A callback function.
 * @summary Subscribe to a MQTT topic.
 */
export const subscribe = (client, sub, callback) => {
	if (!client) {
		//authorize subscribe from null clients
		callback(null, sub);
		return;
	}

	if (client.uuid == 'development') {
		//authorize development users for everything
		callback(null, sub);
		return;
	}

	if (sub.topic.match(new RegExp('^nodes/' + client.uuid + '/\\S+'))) {
		callback(null, sub);
		return;
	} else {
		log(
			'Aedes',
			'Node ' + client.uuid + ' tried to subscribe to a topic it does not own',
			'warning'
		);
		callback(new Error('Can subscribe only to own topic'));
		return;
	}
};
