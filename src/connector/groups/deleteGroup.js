const deleteGroup = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM groups WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.get('DELETE FROM groups WHERE id=$id', { $id: id }, err => {
							if (err) {
								reject(err);
							} else {
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
