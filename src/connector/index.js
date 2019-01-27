import Authenticate from './authenticate';
import Login from './login';
import Logout from './logout';
import GetUsers from './getUsers';
import GetUser from './getUser';
import GetSessions from './getSessions';

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

	getUsers() {
		return GetUsers(this);
	}

	getUser(id) {
		return GetUser(this, id);
	}

	getSessions(uid) {
		return GetSessions(this, uid);
	}
}

const connector = new Connector();

export default connector;
