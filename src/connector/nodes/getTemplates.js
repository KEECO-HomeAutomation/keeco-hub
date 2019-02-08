const getTemplates = (conn, node) => {
	return new Promise((resolve, reject) => {
		conn.db.all(
			'SELECT id, name FROM node_templates WHERE node=$node',
			{ $node: node },
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
