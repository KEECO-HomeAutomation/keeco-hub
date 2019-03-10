import Authenticate from './root/authenticate';
import Login from './root/login';
import Logout from './root/logout';
import GetUsers from './users/getUsers';
import GetUser from './users/getUser';
import GetSessions from './users/getSessions';
import CreateUser from './users/createUser';
import UpdateUser from './users/updateUser';
import DeleteUser from './users/deleteUser';
import GetNodes from './nodes/getNodes';
import GetNode from './nodes/getNode';
import GetEndpoints from './nodes/getEndpoints';
import GetTemplates from './nodes/getTemplates';
import GetMapping from './nodes/getMapping';
import GetTemplateData from './nodes/getTemplateData';
import GetTemplateMappings from './nodes/getTemplateMappings';
import GetEndpointForMapping from './nodes/getEndpointForMapping';
import GetNodesByTemplate from './nodes/getNodesByTemplate';
import UpdateNode from './nodes/updateNode';
import UpdateTemplateData from './nodes/updateTemplateData';

class Connector {
	init(options, callback) {
		this.db = options.db;
		this.mqtt = options.mqtt;
		this.gql = options.gql;
		callback();
	}

	/*
	 * root
	 */
	authenticate(token) {
		return Authenticate(this, token);
	}

	login(username, password) {
		return Login(this, username, password);
	}

	logout(token) {
		return Logout(this, token);
	}

	/*
	 * users
	 */
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

	/*
	 * nodes
	 */
	getNodes() {
		return GetNodes(this);
	}

	getNode(id) {
		return GetNode(this, id);
	}

	getEndpoints(nodeID, nodeUUID) {
		return GetEndpoints(this, nodeID, nodeUUID);
	}

	getTemplates(nodeID) {
		return GetTemplates(this, nodeID);
	}

	getMapping(nodeUUID, templateID, name) {
		return GetMapping(this, nodeUUID, templateID, name);
	}

	getTemplateData(templateID, templateName) {
		return GetTemplateData(this, templateID, templateName);
	}

	getTemplateMappings(templateID) {
		return GetTemplateMappings(this, templateID);
	}

	getEndpointForMapping(mappingID) {
		return GetEndpointForMapping(this, mappingID);
	}

	getNodesByTemplate(templateName) {
		return GetNodesByTemplate(this, templateName);
	}

	updateNode(nodeID, options) {
		return UpdateNode(this, nodeID, options);
	}

	updateTemplateData(templateID, options) {
		return UpdateTemplateData(this, templateID, options);
	}
}

const connector = new Connector();

export default connector;
