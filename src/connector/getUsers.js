const getUsers = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, username FROM users', {}, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
};

export default getUsers;
