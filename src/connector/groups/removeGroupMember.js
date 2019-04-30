const removeGroupMember = (conn, id, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM group_members WHERE pgroup=$id and node=$nodeID',
			{ $id: id, $nodeID: nodeID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.run(
							'DELETE FROM group_members WHERE pgroup=$id and node=$nodeID',
							{ $id: id, $nodeID: nodeID },
							err => {
								if (err) {
									reject(err);
								} else {
									let group = conn.getGroup(id);
									conn.groupSubscription().publish('UPDATED', group);
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

export default removeGroupMember;
