const getGroupMembers = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.all(
			'SELECT n.id, n.uuid, n.name FROM group_members AS gm INNER JOIN nodes AS n ON (n.id=gm.node) WHERE gm.pgroup=$id',
			{ $id: id },
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

export default getGroupMembers;
