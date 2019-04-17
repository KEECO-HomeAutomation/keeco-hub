import ranger from 'number-ranger';
import { UserInputError } from 'apollo-server';

const updateTemplateData = (conn, templateID, options) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT n.id AS nodeID, n.uuid, nt.id, nt.name FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$templateID',
			{ $templateID: templateID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (!row) {
						resolve(null);
					} else {
						updateMQTT(conn, row.uuid, templateID, options).then(
							() => {
								conn
									.nodeSubscription()
									.publish('UPDATED', conn.getNode(row.nodeID));
								resolve({
									id: row.id,
									name: row.name
								});
							},
							err => {
								if (err.db) {
									reject(err.db);
								} else {
									reject(new UserInputError(err.message));
								}
							}
						);
					}
				}
			}
		);
	});
};

const updateMQTT = (conn, nodeUUID, templateID, options) => {
	var mappings = Object.keys(options);

	return new Promise((resolve, reject) => {
		const updateForMapping = i => {
			//get bounds
			conn.db.get(
				`SELECT ne.range, ne.output FROM node_template_mappings AS ntm INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) 
				WHERE ntm.node_template=$templateID and ntm.name=$templateName`,
				{ $templateID: templateID, $templateName: mappings[i] },
				(err, row) => {
					if (err) {
						reject({ db: err });
					} else {
						if (row) {
							if (row.output) {
								//convert value to numeric
								let value = +options[mappings[i]];
								//check if value is in range
								if (row.range === null || ranger.isInRange(value, row.range)) {
									//get mapping
									conn
										.getMapping(nodeUUID, templateID, mappings[i])
										.then(mapping => {
											conn.mqtt.aedes.publish(
												{
													topic: mapping,
													payload: value.toString()
												},
												() => {
													if (i + 1 < mappings.length) {
														updateForMapping(i + 1);
													} else {
														resolve();
													}
												}
											);
										});
								} else {
									reject({
										message:
											'Value ' +
											value +
											' not in range (' +
											row.range +
											') for ' +
											mappings[i]
									});
								}
							} else {
								reject({
									message:
										'Pin for mapping ' + mappings[i] + ' not an output pin'
								});
							}
						} else {
							reject({
								message:
									'Endpoint ' + mappings[i] + ' not available for template'
							});
						}
					}
				}
			);
		};

		updateForMapping(0);
	});
};

export default updateTemplateData;
