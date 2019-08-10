const getNodesByTemplate = (conn, templateName) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all(
				'SELECT n.id, n.uuid, n.name FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.name=$templateName ORDER BY n.id ASC',
				{ $templateName: templateName }
			)
			.then(rows => {
				resolve(rows);
			}, reject);
	});
};

export default getNodesByTemplate;
