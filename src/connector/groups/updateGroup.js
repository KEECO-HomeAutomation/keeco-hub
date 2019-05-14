const updateGroup = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM groups WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.run(
							'UPDATE groups SET name=$name, is_room=$is_room WHERE id=$id',
							{ $name: options.name, $is_room: options.is_room, $id: id },
							err => {
								if (err) {
									reject(err);
								} else {
									let group = conn.getGroup(id);
									conn.groupSubscription().publish('UPDATED', group);
									resolve(group);
								}
							}
						);
					}
				}
			}
		);
	});
};

export default updateGroup;
