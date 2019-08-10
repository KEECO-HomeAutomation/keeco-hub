const getGroups = conn => {
	return new Promise((resolve, reject) => {
		conn.db.all('SELECT id, name, is_room FROM groups').then(rows => {
			resolve(rows);
		}, reject);
	});
};

export default getGroups;
