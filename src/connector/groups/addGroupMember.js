const addGroupMember = (conn, id, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM group_members WHERE group=$id and node=$nodeID',
			{ $id: id, $nodeID: nodeID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count) {
						resolve(null);
					} else {
						conn.db.run(
							'INSERT INTO group_members (group, node) VALUES ($id, $nodeID)',
							{ $id: id, $nodeID: nodeID },
							err => {
								if (err) {
									reject(err);
								} else {
									let group = conn.getGroup(id);
									resolve(group);
								}
							}
						);
					}
				}
			}
		);
	});
};

export default addGroupMember;
