const getGroup = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT id, name, is_room FROM groups WHERE id=$id', { $id: id })
			.then(row => {
				if (row) {
					resolve(row);
				} else {
					resolve(null);
				}
			}, reject);
	});
};

export default getGroup;
