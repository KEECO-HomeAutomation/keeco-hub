jest.mock('./root/authenticate', () =>
	jest.fn().mockReturnValue({ mocked: 'authenticate' })
);
jest.mock('./root/login', () => jest.fn().mockReturnValue({ mocked: 'login' }));
jest.mock('./root/logout', () =>
	jest.fn().mockReturnValue({ mocked: 'logout' })
);
jest.mock('./users/getUsers', () =>
	jest.fn().mockReturnValue({ mocked: 'getUsers' })
);
jest.mock('./users/getUser', () =>
	jest.fn().mockReturnValue({ mocked: 'getUser' })
);
jest.mock('./users/getSessions', () =>
	jest.fn().mockReturnValue({ mocked: 'getSessions' })
);
jest.mock('./users/createUser', () =>
	jest.fn().mockReturnValue({ mocked: 'createUser' })
);
jest.mock('./users/updateUser', () =>
	jest.fn().mockReturnValue({ mocked: 'updateUser' })
);
jest.mock('./users/deleteUser', () =>
	jest.fn().mockReturnValue({ mocked: 'deleteUser' })
);
jest.mock('./users/userSubscription', () =>
	jest.fn().mockReturnValue({ mocked: 'userSubscription' })
);
jest.mock('./nodes/getNodes', () =>
	jest.fn().mockReturnValue({ mocked: 'getNodes' })
);
jest.mock('./nodes/getNode', () =>
	jest.fn().mockReturnValue({ mocked: 'getNode' })
);
jest.mock('./nodes/getEndpoints', () =>
	jest.fn().mockReturnValue({ mocked: 'getEndpoints' })
);
jest.mock('./nodes/getTemplates', () =>
	jest.fn().mockReturnValue({ mocked: 'getTemplates' })
);
jest.mock('./nodes/getMapping', () =>
	jest.fn().mockReturnValue({ mocked: 'getMapping' })
);
jest.mock('./nodes/getTemplateData', () =>
	jest.fn().mockReturnValue({ mocked: 'getTemplateData' })
);
jest.mock('./nodes/getTemplateMappings', () =>
	jest.fn().mockReturnValue({ mocked: 'getTemplateMappings' })
);
jest.mock('./nodes/getEndpointForMapping', () =>
	jest.fn().mockReturnValue({ mocked: 'getEndpointForMapping' })
);
jest.mock('./nodes/getNodesByTemplate', () =>
	jest.fn().mockReturnValue({ mocked: 'getNodesByTemplate' })
);
jest.mock('./nodes/updateNode', () =>
	jest.fn().mockReturnValue({ mocked: 'updateNode' })
);
jest.mock('./nodes/updateTemplateData', () =>
	jest.fn().mockReturnValue({ mocked: 'updateTemplateData' })
);
jest.mock('./nodes/deleteNode', () =>
	jest.fn().mockReturnValue({ mocked: 'deleteNode' })
);
jest.mock('./nodes/nodeSubscription', () =>
	jest.fn().mockReturnValue({ mocked: 'nodeSubscription' })
);
jest.mock('./groups/getGroups', () =>
	jest.fn().mockReturnValue({ mocked: 'getGroups' })
);
jest.mock('./groups/getGroup', () =>
	jest.fn().mockReturnValue({ mocked: 'getGroup' })
);
jest.mock('./groups/createGroup', () =>
	jest.fn().mockReturnValue({ mocked: 'createGroup' })
);
jest.mock('./groups/updateGroup', () =>
	jest.fn().mockReturnValue({ mocked: 'updateGroup' })
);
jest.mock('./groups/updateGroupData', () =>
	jest.fn().mockReturnValue({ mocked: 'updateGroupData' })
);
jest.mock('./groups/addGroupMember', () =>
	jest.fn().mockReturnValue({ mocked: 'addGroupMember' })
);
jest.mock('./groups/removeGroupMember', () =>
	jest.fn().mockReturnValue({ mocked: 'removeGroupMember' })
);
jest.mock('./groups/deleteGroup', () =>
	jest.fn().mockReturnValue({ mocked: 'deleteGroup' })
);
jest.mock('./groups/getGroupMembers', () =>
	jest.fn().mockReturnValue({ mocked: 'getGroupMembers' })
);
jest.mock('./groups/getGroupData', () =>
	jest.fn().mockReturnValue({ mocked: 'getGroupData' })
);
jest.mock('./groups/groupSubscription', () =>
	jest.fn().mockReturnValue({ mocked: 'groupSubscription' })
);
jest.mock('./mqtt/getTopic', () =>
	jest.fn().mockReturnValue({ mocked: 'getTopic' })
);
jest.mock('./mqtt/publishTopic', () =>
	jest.fn().mockReturnValue({ mocked: 'publishTopic' })
);
jest.mock('./mqtt/subscribeTopic', () =>
	jest.fn().mockReturnValue({ mocked: 'subscribeTopic' })
);

import Connector from './index';

describe('Testing main connector', () => {
	test('init should resolve', () => {
		expect(Connector.init({ db: null, mqtt: null, gql: null })).resolves.toBe(
			undefined
		);
	});

	describe('Each child function should call a submodule', () => {
		const childFuncs = Object.getOwnPropertyNames(Connector.__proto__);
		childFuncs.forEach(func => {
			if (!['init', 'constructor'].includes(func)) {
				test('Child function <' + func + '> should call submodule', () => {
					expect(Connector.__proto__[func]()).toEqual({ mocked: func });
				});
			}
		});
	});
});
