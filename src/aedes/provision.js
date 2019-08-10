import * as yup from 'yup';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module aedes/provision
 * @summary TODO
 */

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function provision
 * @param {*} conn
 * @param {*} prov
 * @summary Provison. TODO.
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
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function addNode
 * @param {*} conn
 * @param {*} prov
 * @summary Add node.
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

export default provision;
