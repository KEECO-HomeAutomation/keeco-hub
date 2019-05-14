const deleteGroup = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count, name, is_room FROM groups WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.run('DELETE FROM groups WHERE id=$id', { $id: id }, err => {
							if (err) {
								reject(err);
							} else {
								conn.groupSubscription().publish('DELETED', {
									id,
									name: row.name,
									is_room: row.is_room
								});
								resolve({ id });
							}
						});
					}
				}
			}
		);
	});
};

export default deleteGroup;
