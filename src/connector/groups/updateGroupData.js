const updateGroupData = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		const mappedOptions = options.reduce((acc, cur) => {
			return {
				...acc,
				[cur.name]: cur.value
			};
		}, {});

		conn.db
			.all(
				`SELECT nt.id FROM group_members AS gm 
				INNER JOIN nodes AS n ON (n.id=gm.node) 
				INNER JOIN node_templates AS nt ON (nt.node=n.id)
				WHERE gm.pgroup=$id`,
				{ $id: id }
			)
			.then(rows => {
				const promises = [];
				rows.forEach(row => {
					promises.push(conn.updateTemplateData(row.id, mappedOptions));
				});

				Promise.all(promises).then(
					() => {
						const group = conn.getGroup(id);
						conn.groupSubscription().publish('UPDATED', group);
						resolve(group);
					},
					err => {
						reject(err);
					}
				);
			}, reject);
	});
};

export default updateGroupData;
