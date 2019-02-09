const getEndpointForMapping = (conn, mappingID) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			`SELECT ne.name, ne.output, ne.range, n.uuid 
			FROM node_template_mappings AS ntm 
			INNER JOIN node_endpoints AS ne ON (ne.id=ntm.endpoint) 
			INNER JOIN node_templates AS nt ON (nt.id=ntm.node_template) 
			INNER JOIN nodes AS n ON (n.id=nt.node) 
			WHERE ntm.id=$mapping`,
			{ $mapping: mappingID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve({
						name: row.name,
						output: row.output,
						range: row.range,
						value: conn.mqtt.store.get('nodes/' + row.uuid + '/' + row.name)
							.value
					});
				}
			}
		);
	});
};

export default getEndpointForMapping;
