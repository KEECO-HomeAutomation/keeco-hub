const getNode = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT id, uuid, name FROM nodes WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (!row) {
						resolve(null);
					} else {
						resolve(row);
					}
				}
			}
		);
	});
};

export default getNode;
