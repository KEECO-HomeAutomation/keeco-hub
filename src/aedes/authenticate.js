import connector from '../connector';
import provision from './provision';
import { log, isDev } from '../utils';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedes/authenticate
 * @summary Authenticate MQTT users
 */

/**
 * @callback authenticationCallback
 * @summary Callback to authorize authentication
 * @param {Error} error - Set to error if error happened
 * @param {boolean} successful - Set to true if authentication succeeded
 */
/**
 * If the username is not set, it fails. If it is running on a development environment and
 * the user's username and the user's password is 'development', then it logs in without provision.
 * If the username (provision string) is over 10000 characters it will deny the authentication
 * with error code 1 (Unacceptable protocol version). If JSON can't be parsed it will fail with
 * error code 2 (Identifier rejected). It will then provision the client. If the privisioning fails
 * the node will be rejected with error code 2.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function authenticate
 * @summary Authenticate mqtt user
 * @param {Object<string, *>} client - Client object
 * @param {string} client.uuid - Client uuid (can be overwritten)
 * @param {string} username - Username of the user
 * @param {string} password - Password of the user
 * @param {authenticationCallback} callback - callback
 * @see module:aedes/provision
 */
const authenticate = (client, username, password, callback) => {
	if (!username) {
		log('Aedes', 'Connection with no username set', 'warning');
		const error = new Error('No username set');
		error.returnCode = 4;
		callback(error, null);
		return;
	}

	if (isDev() && username == 'development' && password == 'development') {
		log('Aedes', 'MQTT development user attached');

		client.uuid = 'development';

		callback(null, true);
		return;
	}

	//check length to don't parse loooooong jsons
	if (username.length > 10000) {
		log('Aedes', 'Received a provision JSON over 10000 characters', 'warning');
		const error = new Error('Provision JSON too long');
		error.returnCode = 1;
		callback(error, null);
		return;
	}

	//try to parse json
	let parsed;
	try {
		parsed = JSON.parse(username);
	} catch (e) {
		log(
			'Aedes',
			'Received an invalid JSON as provision JSON. Error:' + e,
			'warning'
		);
		const error = new Error('Bad JSON');
		error.returnCode = 2;
		callback(error, null);
		return;
	}

	//provision client
	provision(connector, parsed).then(
		({ isNew, uuid }) => {
			if (isNew) {
				log('Aedes', 'New node provisioned');
			} else {
				log('Aedes', 'Node connected');
			}

			client.uuid = uuid;

			callback(null, true);
			return;
		},
		err => {
			log('Aedes', 'Provision failed. Error: ' + err, 'error');
			const error = new Error('Bad provision JSON');
			error.returnCode = 2;
			callback(error, null);
			return;
		}
	);
};

/** Function used for authentication */
export default authenticate;
