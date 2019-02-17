import connector from '../connector';
import provision from './provision';
import { log, isDev } from '../utils';

const authenticate = (client, username, password, callback) => {
	//if no username is set, automatically fail
	if (!username) {
		log('Aedes', 'Connection with no username set', 'warning');
		let error = new Error('No username set');
		error.returnCode = 4;
		callback(error, null);
		return;
	}

	//if username is development and password is development, then log user in without provision
	if (isDev() && username == 'development' && password == 'development') {
		log('Aedes', 'MQTT development user attached');

		//attach uuid to client
		client.uuid = 'development';

		//call callback
		callback(null, true);
		return;
	}

	//check length to don't parse loooooong jsons
	if (username.length > 10000) {
		log('Aedes', 'Received a provision JSON over 10000 characters', 'warning');
		let error = new Error('Provision JSON too long');
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
		let error = new Error('Bad JSON');
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

			//attach uuid to client
			client.uuid = uuid;

			//call callback
			callback(null, true);
			return;
		},
		err => {
			log('Aedes', 'Provision failed. Error: ' + err, 'error');
			let error = new Error('Bad provision JSON');
			error.returnCode = 2;
			callback(error, null);
			return;
		}
	);
};

export default authenticate;
