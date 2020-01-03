const getTemplates = (conn, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all('SELECT id, name FROM node_templates WHERE node=$node', {
				$node: nodeID
			})
			.then(rows => {
				resolve(rows);
			}, reject);
	});
};

export default getTemplates;
