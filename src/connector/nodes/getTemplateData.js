const getTemplateData = (conn, templateID, templateName) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT n.uuid FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$id',
			{ $id: templateID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(getValues(conn, row.uuid, templateID, templateName));
				}
			}
		);
	});
};

const getValues = async (conn, node, templateID, templateName) => {
	switch (templateName) {
		case 'switch':
			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				on:
					conn.mqtt.store.get(await getMapping(conn, node, templateID, 'on'))
						.value > 0
						? true
						: false
			};
		case 'lamp':
			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				on:
					conn.mqtt.store.get(await getMapping(conn, node, templateID, 'on'))
						.value > 0
						? true
						: false,
				r: conn.mqtt.store.get(await getMapping(conn, node, templateID, 'r'))
					.value,
				g: conn.mqtt.store.get(await getMapping(conn, node, templateID, 'g'))
					.value,
				b: conn.mqtt.store.get(await getMapping(conn, node, templateID, 'b'))
					.value,
				dim: conn.mqtt.store.get(
					await getMapping(conn, node, templateID, 'dim')
				).value
			};
		case 'thermostat':
			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				temperature: conn.mqtt.store.get(
					await getMapping(conn, node, templateID, 'temperature')
				).value
			};
		default:
			return null;
	}
};

const getMapping = (conn, node, templateID, name) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT ne.name FROM node_template_mappings AS ntm INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) WHERE ntm.node_template=$template and ntm.name=$name',
			{ $template: templateID, $name: name },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve('nodes/' + node + '/' + row.name);
				}
			}
		);
	});
};

export default getTemplateData;
