const updateGroup = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'UPDATE groups SET name=$name, is_room=$is_room WHERE id=$id',
			{ $name: options.name, $is_room: options.is_room, $id: id },
			err => {
				if (err) {
					reject(err);
				} else {
					let group = conn.getGroup(id);
					resolve(group);
				}
			}
		);
	});
};

export default updateGroup;
