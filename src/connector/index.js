import Authenticate from './authenticate';
import Login from './login';
import Logout from './logout';
import GetUsers from './getUsers';
import GetUser from './getUser';
import GetSessions from './getSessions';
import CreateUser from './createUser';
import UpdateUser from './updateUser';
import DeleteUser from './deleteUser';

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

	createUser(options) {
		return CreateUser(this, options);
	}

	updateUser(id, options) {
		return UpdateUser(this, id, options);
	}

	deleteUser(id) {
		return DeleteUser(this, id);
	}
}

const connector = new Connector();

export default connector;
