const updateNode = (conn, nodeID, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'UPDATE nodes SET name=$name WHERE id=$id',
			{ $id: nodeID, $name: options.name },
			err => {
				if (err) {
					reject(err);
				} else {
					let node = conn.getNode(nodeID);
					conn.nodeSubscription().publish('UPDATED', node);
					resolve(node);
				}
			}
		);
	});
};

export default updateNode;
