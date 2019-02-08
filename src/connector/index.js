import Authenticate from './root/authenticate';
import Login from './root/login';
import Logout from './root/logout';
import GetUsers from './users/getUsers';
import GetUser from './users/getUser';
import GetSessions from './users/getSessions';
import CreateUser from './users/createUser';
import UpdateUser from './users/updateUser';
import DeleteUser from './users/deleteUser';

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
