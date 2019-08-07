const getMapping = (conn, nodeUUID, templateID, name) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT ne.name FROM node_template_mappings AS ntm INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) WHERE ntm.node_template=$template and ntm.name=$name',
				{ $template: templateID, $name: name }
			)
			.then(row => {
				if (!row) {
					resolve(null);
				} else {
					resolve('nodes/' + nodeUUID + '/' + row.name);
				}
			}, reject);
	});
};

export default getMapping;
