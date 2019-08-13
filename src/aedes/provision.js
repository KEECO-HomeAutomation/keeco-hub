import * as yup from 'yup';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedes/provision
 * @summary Provisions a node to the system
 */

/**
 * Validates the provision object against the provisionSchema. If the node already exists it will
 * authorize its connection. Otherwise it will call the addNode function.
 * If the node is newly created, it will publish to the nodeSubscription.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function provision
 * @summary Provision new nodes
 * @param {Connector} conn - The connector
 * @param {Object<string, *>} prov - The provision object matching the provisionSchema
 * @see module:aedes/provision~provisionSchema
 * @returns {Promise<Object<string, *>>} Resolves with object containing isNew (true if node is new)
 * and uuid (the UUID of the node)
 */
const provision = (conn, prov) => {
	return new Promise((resolve, reject) => {
		//check if JSON is OK
		JSONSchema.isValid(prov).then(valid => {
			if (!valid) {
				reject(new Error('Invalid JSON'));
			} else {
				//check if node already exists
				conn.db
					.all('SELECT id FROM nodes WHERE uuid=$uuid', { $uuid: prov.uuid })
					.then(rows => {
						if (rows.length > 0) {
							resolve({ isNew: false, uuid: prov.uuid });
						} else {
							//try to add node
							addNode(conn, prov).then(id => {
								//publish node created subscription
								conn.nodeSubscription().publish('CREATED', {
									id: id,
									uuid: prov.uuid,
									name: prov.name
								});
								resolve({ isNew: true, uuid: prov.uuid });
							}, reject);
						}
					}, reject);
			}
		});
	});
};

/**
 * It inserts to the database the node, its endpoints, its templates and its mappings.
 * If anything fails, the whole node creation fails. Rollback not implemented yet.
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function addNode
 * @summary Adds a node
 * @param {Connector} conn - The connector
 * @param {Object<string, *>} prov - The provision object
 * @returns {Promise<number>} Resolves to the ID of the newly created node
 */
const addNode = (conn, prov) => {
	return new Promise((resolve, reject) => {
		let nodeID = null,
			endpointsMap = {};

		//insert node
		conn.db
			.run('INSERT INTO nodes (uuid, name) VALUES ($uuid, $name)', {
				$uuid: prov.uuid,
				$name: prov.name
			})
			.then(res => {
				nodeID = res.lastID;
				//insert endpoints
				return Promise.all(
					prov.endpoints.map(endpoint => {
						let promise = conn.db.run(
							'INSERT INTO node_endpoints (node, name, output, range) VALUES ($node, $name, $output, $range)',
							{
								$node: nodeID,
								$name: endpoint.name,
								$output: endpoint.output || 0,
								$range: endpoint.range || null
							}
						);
						promise.then(res => {
							endpointsMap[endpoint.name] = res.lastID;
						});
						return promise;
					})
				);
			}, reject)
			.then(() => {
				//insert templates
				return Promise.all(
					prov.templates.map(template => {
						return conn.db.run(
							'INSERT INTO node_templates (node, name) VALUES ($node, $name)',
							{ $node: nodeID, $name: template.name }
						);
					})
				);
			}, reject)
			.then(res => {
				//insert mappings
				return Promise.all(
					res.reduce((acc, templateRes, i) => {
						return [
							...acc,
							...prov.templates[i].mappings.map(mapping => {
								return conn.db.run(
									'INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES ($template, $name, $endpoint)',
									{
										$template: templateRes.lastID,
										$name: mapping.name,
										$endpoint: endpointsMap[mapping.endpoint]
									}
								);
							})
						];
					}, [])
				);
			}, reject)
			.then(() => {
				resolve(nodeID);
			}, reject);
	});
};

/**
 * Schema used to validate provision objects
 * @name provisionSchema
 */
const JSONSchema = yup.object().shape({
	uuid: yup.string().required(),
	name: yup.string(),
	endpoints: yup
		.array()
		.of(
			yup.object().shape({
				name: yup.string().required(),
				output: yup.boolean(),
				range: yup.string()
			})
		)
		.required(),
	templates: yup
		.array()
		.of(
			yup.object().shape({
				name: yup.string().required(),
				mappings: yup
					.array()
					.of(
						yup.object().shape({
							name: yup.string().required(),
							endpoint: yup.string().required()
						})
					)
					.required()
			})
		)
		.required()
});

/** Function used for node provisioning */
export default provision;
