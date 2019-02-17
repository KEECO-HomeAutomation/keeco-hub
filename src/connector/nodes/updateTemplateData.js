const updateTemplateData = (conn, templateID, options) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT n.uuid, nt.id, nt.name FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$templateID',
			{ $templateID: templateID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (!row) {
						resolve(null);
					} else {
						updateMQTT(conn, row.uuid, templateID, options).then(() => {
							resolve({
								id: row.id,
								name: row.name
							});
						});
					}
				}
			}
		);
	});
};

const updateMQTT = async (conn, nodeUUID, templateID, options) => {
	var mappings = Object.keys(options);

	const updateForMapping = async i => {
		let mapping = await conn.getMapping(nodeUUID, templateID, mappings[i]);
		if (mapping) {
			conn.mqtt.aedes.publish(
				{
					topic: mapping,
					payload: options[mappings[i]]
				},
				() => {
					if (i + 1 < mappings.length) {
						updateForMapping(i + 1);
					} else {
						return true;
					}
				}
			);
		}
	};

	await updateForMapping(0);
};

export default updateTemplateData;
