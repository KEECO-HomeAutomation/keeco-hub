const getUser = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT id, username FROM users WHERE id=$id', { $id: id })
			.then(row => {
				resolve(row);
			}, reject);
	});
};

export default getUser;
