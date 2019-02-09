const getTemplates = (conn, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db.all(
			'SELECT id, name FROM node_templates WHERE node=$node',
			{ $node: nodeID },
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows);
				}
			}
		);
	});
};

export default getTemplates;
