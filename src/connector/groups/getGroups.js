const getGroups = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, name, is_room FROM groups', {}, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
};

export default getGroups;
