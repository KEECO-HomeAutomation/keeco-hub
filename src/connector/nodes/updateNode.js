const updateNode = (conn, nodeID, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'UPDATE nodes SET name=$name WHERE id=$id',
			{ $id: nodeID, $name: options.name },
			err => {
				if (err) {
					reject(err);
				} else {
					resolve(conn.getNode(nodeID));
				}
			}
		);
	});
};

export default updateNode;
