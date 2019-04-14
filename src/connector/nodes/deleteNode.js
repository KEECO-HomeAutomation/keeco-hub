const deleteNode = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) as count, uuid, name FROM nodes WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.run('DELETE FROM nodes WHERE id=$id', { $id: id }, err => {
							if (err) {
								reject(err);
							} else {
								conn.nodeSubscription().publish('DELETED', {
									id: id,
									uuid: row.uuid,
									name: row.name
								});
								resolve({ id: id });
							}
						});
					}
				}
			}
		);
	});
};

export default deleteNode;
