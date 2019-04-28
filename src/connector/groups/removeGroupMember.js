const removeGroupMember = (conn, id, nodeID) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'DELETE FROM group_members WHERE group=$id and node=$nodeID',
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
	});
};

export default removeGroupMember;
