const removeGroupMember = (conn, id, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT COUNT(id) AS count FROM group_members WHERE pgroup=$id and node=$nodeID',
				{ $id: id, $nodeID: nodeID }
			)
			.then(row => {
				if (row.count === 0) {
					resolve(null);
				} else {
					conn.db
						.run(
							'DELETE FROM group_members WHERE pgroup=$id and node=$nodeID',
							{ $id: id, $nodeID: nodeID }
						)
						.then(() => {
							const group = conn.getGroup(id);
							conn.groupSubscription().publish('UPDATED', group);
							resolve(group);
						}, reject);
				}
			}, reject);
	});
};

export default removeGroupMember;
