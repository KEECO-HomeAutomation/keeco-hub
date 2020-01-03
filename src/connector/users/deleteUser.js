const deleteUser = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT COUNT(id) AS count, username FROM users WHERE id=$id', {
				$id: id
			})
			.then(row => {
				if (row.count === 0) {
					resolve(null);
				} else {
					conn.db
						.run('DELETE FROM users WHERE id=$id', { $id: id })
						.then(() => {
							conn
								.userSubscription()
								.publish('DELETED', { id, username: row.username });
							resolve({ id });
						}, reject);
				}
			}, reject);
	});
};

export default deleteUser;
