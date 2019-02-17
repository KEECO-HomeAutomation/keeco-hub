const getTemplateData = (conn, templateID, templateName) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT n.uuid FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$id',
			{ $id: templateID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row) {
						try {
							var values = getValues(conn, row.uuid, templateID, templateName);
						} catch (e) {
							reject(e);
						}
						resolve(values);
					} else {
						resolve(null);
					}
				}
			}
		);
	});
};

const getValues = async (conn, node, templateID, templateName) => {
	var mappings = {};
	switch (templateName) {
		case 'switch':
			try {
				mappings.on = await getMapping(conn, node, templateID, 'on');
			} catch (e) {
				throw e;
			}

			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				on: conn.mqtt.store.get(mappings.on).value > 0 ? true : false
			};

		case 'lamp':
			try {
				mappings.on = await getMapping(conn, node, templateID, 'on');
				mappings.r = await getMapping(conn, node, templateID, 'r');
				mappings.g = await getMapping(conn, node, templateID, 'g');
				mappings.b = await getMapping(conn, node, templateID, 'b');
				mappings.dim = await getMapping(conn, node, templateID, 'dim');
			} catch (e) {
				throw e;
			}

			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				on: conn.mqtt.store.get(mappings.on).value > 0 ? true : false,
				r: conn.mqtt.store.get(mappings.r).value,
				g: conn.mqtt.store.get(mappings.g).value,
				b: conn.mqtt.store.get(mappings.b).value,
				dim: conn.mqtt.store.get(mappings.dim).value
			};

		case 'thermostat':
			try {
				mappings.temperature = await getMapping(
					conn,
					node,
					templateID,
					'temperature'
				);
			} catch (e) {
				throw e;
			}

			return {
				id: node + '_' + templateID + '_' + templateName + '_data',
				temperature: conn.mqtt.store.get(mappings.temperature).value
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
