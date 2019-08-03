const createGroup = (conn, options) => {
	return new Promise((resolve, reject) => {
		conn.db
			.run('INSERT INTO groups (name, is_room) VALUES ($name, $is_room)', {
				$name: options.name,
				$is_room: options.is_room
			})
			.then(res => {
				let group = { ...options, id: res.lastID };
				conn.groupSubscription().publish('CREATED', group);
				resolve(group);
			}, reject);
	});
};

export default createGroup;
