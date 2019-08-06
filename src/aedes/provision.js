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
 * @summary Provison.
 */
const provision = (conn, prov) => {
	return new Promise((resolve, reject) => {
		//check if JSON is OK
		JSONSchema.isValid(prov).then(valid => {
			if (!valid) {
				reject(new Error('Invalid JSON'));
			} else {
				//check if node already exists
				conn.db.all(
					'SELECT id FROM nodes WHERE uuid=$uuid',
					{ $uuid: prov.uuid },
					(err, rows) => {
						if (err) {
							reject(err);
						} else {
							if (rows.length > 0) {
								resolve({ isNew: false, uuid: prov.uuid });
							} else {
								//try to add node
								try {
									addNode(conn, prov, id => {
										//publish node created subscription
										conn.nodeSubscription().publish('CREATED', {
											id: id,
											uuid: prov.uuid,
											name: prov.name
										});
										resolve({ isNew: true, uuid: prov.uuid });
									});
								} catch (e) {
									reject(e);
								}
							}
						}
					}
				);
			}
		});
	});
};

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function addNode
 * @param {*} conn
 * @param {*} prov
 * @param {function} callback - A callback function.
 * @summary Add node.
 */
const addNode = (conn, prov, callback) => {
	//insert node
	conn.db.run(
		'INSERT INTO nodes (uuid, name) VALUES ($uuid, $name)',
		{ $uuid: prov.uuid, $name: prov.name },
		function(err) {
			if (err) {
				throw err;
			}

			var nodeID = this.lastID;

			//insert endpoints
			let endpointsMap = {};
			const insertEndpoint = i => {
				conn.db.run(
					'INSERT INTO node_endpoints (node, name, output, range) VALUES ($node, $name, $output, $range)',
					{
						$node: nodeID,
						$name: prov.endpoints[i].name,
						$output: prov.endpoints[i].output || 0,
						$range: prov.endpoints[i].range || null
					},
					function(err) {
						if (err) {
							throw err;
						}

						endpointsMap[prov.endpoints[i].name] = this.lastID;

						if (i + 1 >= prov.endpoints.length) {
							//inserted all the endpoints. Start inserting templates
							try {
								insertTemplate(0);
							} catch (e) {
								throw e;
							}
						} else {
							try {
								insertEndpoint(i + 1);
							} catch (e) {
								throw e;
							}
						}
					}
				);
			};

			//insert templates
			const insertTemplate = i => {
				conn.db.run(
					'INSERT INTO node_templates (node, name) VALUES ($node, $name)',
					{
						$node: nodeID,
						$name: prov.templates[i].name
					},
					function(err) {
						if (err) {
							throw err;
						}

						var templateID = this.lastID;

						if (i + 1 >= prov.templates.length) {
							//finished inserting templates. Pass main callback to insertMapping
							try {
								insertMapping(
									prov.templates[i].mappings,
									templateID,
									0,
									callback
								);
							} catch (e) {
								throw e;
							}
						} else {
							try {
								insertMapping(prov.templates[i].mappings, templateID, 0, () => {
									insertTemplate(i + 1);
								});
							} catch (e) {
								throw e;
							}
						}
					}
				);
			};

			//insert mappings
			const insertMapping = (mappings, templateID, i, cb) => {
				conn.db.run(
					'INSERT INTO node_template_mappings (node_template, name, endpoint) VALUES ($template, $name, $endpoint)',
					{
						$template: templateID,
						$name: mappings[i].name,
						$endpoint: endpointsMap[mappings[i].endpoint]
					},
					err => {
						if (err) {
							throw err;
						}

						if (i + 1 >= mappings.length) {
							//finished inserting mappings. Calling callback with the id of the node
							cb(nodeID);
						} else {
							try {
								insertMapping(mappings, templateID, i + 1, cb);
							} catch (e) {
								throw e;
							}
						}
					}
				);
			};

			//start sync inserting
			try {
				insertEndpoint(0);
			} catch (e) {
				throw e;
			}
		}
	);
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
