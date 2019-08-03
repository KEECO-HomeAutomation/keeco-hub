const getNodes = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, uuid, name FROM nodes').then(rows => {
			resolve(rows);
		}, reject);
	});
};

export default getNodes;
