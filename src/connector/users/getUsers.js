const getUsers = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, username FROM users', {}).then(rows => {
			resolve(rows);
		}, reject);
	});
};

export default getUsers;
