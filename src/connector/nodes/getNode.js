const getNode = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT id, uuid, name FROM nodes WHERE id=$id', { $id: id })
			.then(row => {
				if (!row) {
					resolve(null);
				} else {
					resolve(row);
				}
			}, reject);
	});
};

export default getNode;
