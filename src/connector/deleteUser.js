const deleteUser = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.run('DELETE FROM users WHERE id=$id', { $id: id }, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ id });
			}
		});
	});
};

export default deleteUser;
