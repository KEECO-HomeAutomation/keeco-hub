const getGroup = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT id, name, is_room FROM groups WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row) {
						resolve(row);
					} else {
						resolve(null);
					}
				}
			}
		);
	});
};

export default getGroup;
