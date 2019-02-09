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

const getValues = (conn, node, templateID, templateName) => {
	switch (templateName) {
		case 'switch':
			return {
				id: node + '_data',
				on: conn.mqtt.store.get(getMapping(conn, node, templateID, 'on'))
			};
		case 'lamp':
			return {
				id: node + '_data',
				on: conn.mqtt.store.get(getMapping(conn, node, templateID, 'on')),
				r: conn.mqtt.store.get(getMapping(conn, node, templateID, 'r')),
				g: conn.mqtt.store.get(getMapping(conn, node, templateID, 'g')),
				b: conn.mqtt.store.get(getMapping(conn, node, templateID, 'b')),
				dim: conn.mqtt.store.get(getMapping(conn, node, templateID, 'dim'))
			};
		case 'thermostat':
			return {
				id: node + '_data',
				temperature: conn.mqtt.store.get(
					getMapping(conn, node, templateID, 'temperature')
				)
			};
		default:
			return null;
	}
};

const getMapping = (conn, node, templateID, name) => {
	conn.db.get(
		'SELECT ne.name FROM node_template_mappings AS ntm INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) WHERE ntm.node_template=$template and ntm.name=$name',
		{ $template: templateID, $name: name },
		(err, row) => {
			if (err) {
				return null;
			} else {
				return 'nodes/' + node + '/' + row.name;
			}
		}
	);
};

export default getTemplateData;
