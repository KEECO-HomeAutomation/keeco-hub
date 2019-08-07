import ranger from 'number-ranger';
import { UserInputError } from 'apollo-server';

const updateTemplateData = (conn, templateID, options) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT n.id AS nodeID, n.uuid, nt.id, nt.name FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$templateID',
				{ $templateID: templateID }
			)
			.then(row => {
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
							if (err.other) {
								reject(err.other);
							} else {
								reject(new UserInputError(err.message));
							}
						}
					);
				}
			}, reject);
	});
};

const updateMQTT = (conn, nodeUUID, templateID, options) => {
	return new Promise((resolve, reject) => {
		var mappingsToUpdate = Object.keys(options);

		Promise.all(
			mappingsToUpdate.map(mapping => {
				return conn.db.get(
					`SELECT ne.range, ne.output FROM node_template_mappings AS ntm INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) 
					WHERE ntm.node_template=$templateID and ntm.name=$templateName`,
					{ $templateID: templateID, $templateName: mapping }
				);
			})
		)
			.then(
				mappings => {
					//reject if mapping not available
					if (mappings.includes(undefined)) {
						reject({
							message:
								'Endpoint ' +
								mappingsToUpdate[mappings.indexOf(undefined)] +
								' not available for template'
						});
					}

					//reject if endpoint not an output
					if (mappings.find(mapping => !mapping.output)) {
						reject({
							message:
								'Endpoint ' +
								mappingsToUpdate[
									mappings.findIndex(mapping => !mapping.output)
								] +
								' is not an output'
						});
					}

					//reject if value not in range
					if (
						mappings.find(
							(mapping, i) =>
								mapping.range !== null &&
								!ranger.isInRange(+options[mappingsToUpdate[i]], mapping.range)
						)
					) {
						let index = mappings.findIndex(
							(mapping, i) =>
								mapping.range !== null &&
								!ranger.isInRange(+options[mappingsToUpdate[i]], mapping.range)
						);
						reject({
							message:
								'Value ' +
								+options[mappingsToUpdate[index]] +
								' not in range (' +
								mappings[index].range +
								') for ' +
								mappingsToUpdate[index]
						});
					}

					return Promise.all(
						mappings.map((mapping, i) => {
							return conn
								.getMapping(nodeUUID, templateID, mappingsToUpdate[i])
								.then(endpoint => {
									return conn.mqtt.aedes.publish({
										topic: endpoint,
										payload: (+options[mappingsToUpdate[i]]).toString()
									});
								});
						})
					);
				},
				err => reject({ other: err })
			)
			.then(resolve, err => reject({ other: err }));
	});
};

export default updateTemplateData;
