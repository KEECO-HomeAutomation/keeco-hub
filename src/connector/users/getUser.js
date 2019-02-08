const getUser = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT id, username FROM users WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			}
		);
	});
};

export default getUser;
