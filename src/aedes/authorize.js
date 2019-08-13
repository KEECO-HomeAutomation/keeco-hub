import { log } from '../utils';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedes/authorize
 * @summary Functions used to authorize MQTT client actions
 */

/**
 * @callback authorizePublishCallback
 * @summary Called to authorize/deny a publish request
 * @param {Error} error - Set to null to authorize, set to error to deny
 */
/**
 * We will authorize a publish if it is an internal message (client is null),
 * if client UUID is development or if the client published on an owned topic.
 * A topic is owned by a node is it has the shape nodes/<uuid>/anything.
 * Else it will deny the publish and drop the client.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function publish
 * @summary Authorization function for packets published
 * @param {Object<string, *>} client - The client object
 * @param {string} client.uuid - The UUID assigned to the client
 * @param {module:aedes/index.MQTTPacket} packet - The packet object
 * @param {authorizePublishCallback} callback - Callback for authorization
 */
/** Publish authorization function */
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
 * @callback authorizeSubscribeCallback
 * @summary Called to authorize/deny a subscribe request
 * @param {Error} error - Set to null to authorize, set to error to deny
 * @param {Object<string, *>} topic - If accepting subscribe, should set to topic object
 */
/**
 * We will authorize a subscribe if it is an internal subscription (client is null),
 * if client UUID is development or if the client subscribes on an owned topic.
 * A topic is owned by a node is it has the shape nodes/<uuid>/anything.
 * Else it will deny the subscribe and drop the client.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function subscribe
 * @summary Authorization function for subscriptions
 * @param {Object<string, *>} client - The client object
 * @param {string} client.uuid - The UUID assigned to the client
 * @param {module:aedes/index.MQTTPacket} sub - The subscription object
 * @param {authorizeSubscribeCallback} callback - Callback for authorization
 */
/** Subscribe authorization function */
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
