import Authenticate from './authenticate';
import Login from './login';
import Logout from './logout';

class Connector {
	init(options, callback) {
		this.db = options.db;
		this.mqtt = options.mqtt;
		this.gql = options.gql;
		callback();
	}

	authenticate(token) {
		return Authenticate(this, token);
	}

	login(username, password) {
		return Login(this, username, password);
	}

	logout(token) {
		return Logout(this, token);
	}
}

const connector = new Connector();

export default connector;
