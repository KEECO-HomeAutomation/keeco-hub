const deleteUser = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM users WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count == 0) {
						resolve(null);
					} else {
						conn.db.run('DELETE FROM users WHERE id=$id', { $id: id }, err => {
							if (err) {
								reject(err);
							} else {
								conn
									.userSubscription()
									.publish('DELETED', { id, username: '' });
								resolve({ id });
							}
						});
					}
				}
			}
		);
	});
};

export default deleteUser;
