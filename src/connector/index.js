import Authenticate from './root/authenticate';
import Login from './root/login';
import Logout from './root/logout';
import GetUsers from './users/getUsers';
import GetUser from './users/getUser';
import GetSessions from './users/getSessions';
import CreateUser from './users/createUser';
import UpdateUser from './users/updateUser';
import DeleteUser from './users/deleteUser';
import UserSubscription from './users/userSubscription';
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
import DeleteNode from './nodes/deleteNode';
import NodeSubscription from './nodes/nodeSubscription';
import GetGroups from './groups/getGroups';
import GetGroup from './groups/getGroup';
import CreateGroup from './groups/createGroup';
import UpdateGroup from './groups/updateGroup';
import UpdateGroupData from './groups/updateGroupData';
import AddGroupMember from './groups/addGroupMember';
import RemoveGroupMember from './groups/removeGroupMember';
import DeleteGroup from './groups/deleteGroup';
import GetGroupMembers from './groups/getGroupMembers';
import GetGroupData from './groups/getGroupData';
import GroupSubscription from './groups/groupSubscription';
import GetTopic from './mqtt/getTopic';
import PublishTopic from './mqtt/publishTopic';
import SubscribeTopic from './mqtt/subscribeTopic';

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

	userSubscription() {
		return UserSubscription(this);
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

	deleteNode(id) {
		return DeleteNode(this, id);
	}

	nodeSubscription() {
		return NodeSubscription(this);
	}

	/*
	 * groups
	 */
	getGroups() {
		return GetGroups(this);
	}

	getGroup(id) {
		return GetGroup(this, id);
	}

	createGroup(options) {
		return CreateGroup(this, options);
	}

	updateGroup(id, options) {
		return UpdateGroup(this, id, options);
	}

	updateGroupData(id, options) {
		return UpdateGroupData(this, id, options);
	}

	addGroupMember(id, nodeID) {
		return AddGroupMember(this, id, nodeID);
	}

	removeGroupMember(id, nodeID) {
		return RemoveGroupMember(this, id, nodeID);
	}

	deleteGroup(id) {
		return DeleteGroup(this, id);
	}

	getGroupMembers(id) {
		return GetGroupMembers(this, id);
	}

	getGroupData(id) {
		return GetGroupData(this, id);
	}

	groupSubscription() {
		return GroupSubscription(this);
	}

	/*
	 * MQTT
	 */
	getTopic(topic) {
		return GetTopic(this, topic);
	}

	publishTopic(topic, payload) {
		return PublishTopic(this, topic, payload);
	}

	subscribeTopic(topic, payload) {
		return SubscribeTopic(this, topic, payload);
	}
}

const connector = new Connector();

export default connector;
