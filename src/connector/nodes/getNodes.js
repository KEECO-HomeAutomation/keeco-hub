const getNodes = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, uuid, name FROM nodes', {}, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
};

export default getNodes;
