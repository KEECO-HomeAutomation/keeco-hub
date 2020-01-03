const getTemplateData = (conn, templateID, templateName) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT n.uuid FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$id',
				{ $id: templateID }
			)
			.then(row => {
				if (row) {
					getValues(conn, row.uuid, templateID, templateName).then(
						resolve,
						reject
					);
				} else {
					resolve(null);
				}
			}, reject);
	});
};

const getValues = (conn, node, templateID, templateName) => {
	return new Promise((resolve, reject) => {
		switch (templateName) {
			case 'switch':
				Promise.all([conn.getMapping(node, templateID, 'on')]).then(
					mappings => {
						resolve({
							id: node + '_' + templateID + '_' + templateName + '_data',
							on: conn.mqtt.store.get(mappings[0]).value > 0 ? true : false
						});
					},
					reject
				);
				break;

			case 'lamp':
				Promise.all([
					conn.getMapping(node, templateID, 'on'),
					conn.getMapping(node, templateID, 'r'),
					conn.getMapping(node, templateID, 'g'),
					conn.getMapping(node, templateID, 'b'),
					conn.getMapping(node, templateID, 'dim')
				]).then(mappings => {
					resolve({
						id: node + '_' + templateID + '_' + templateName + '_data',
						on: conn.mqtt.store.get(mappings[0]).value > 0 ? true : false,
						r: conn.mqtt.store.get(mappings[1]).value,
						g: conn.mqtt.store.get(mappings[2]).value,
						b: conn.mqtt.store.get(mappings[3]).value,
						dim: conn.mqtt.store.get(mappings[4]).value
					});
				}, reject);
				break;

			case 'thermostat':
				Promise.all([conn.getMapping(node, templateID, 'temperature')]).then(
					mappings => {
						resolve({
							id: node + '_' + templateID + '_' + templateName + '_data',
							temperature: conn.mqtt.store.get(mappings[0]).value
						});
					},
					reject
				);
				break;

			default:
				resolve(null);
		}
	});
};

export default getTemplateData;
