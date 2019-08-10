const getTemplateMappings = (conn, templateID) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all(
				'SELECT id, name FROM node_template_mappings WHERE node_template=$template',
				{ $template: templateID }
			)
			.then(rows => {
				resolve(rows);
			}, reject);
	});
};

export default getTemplateMappings;
