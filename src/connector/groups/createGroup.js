const createGroup = (conn, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'INSERT INTO groups (name, is_room) VALUES ($name, $is_room)',
			{ $name: options.name, $is_room: options.is_room },
			function(err) {
				if (err) {
					reject(err);
				} else {
					let group = { ...options, id: this.lastID };
					conn.groupSubscription().publish('CREATED', group);
					resolve(group);
				}
			}
		);
	});
};

export default createGroup;
