const updateNode = (conn, nodeID, options) => {
	return new Promise((resolve, reject) => {
		conn.db
			.run('UPDATE nodes SET name=$name WHERE id=$id', {
				$id: nodeID,
				$name: options.name
			})
			.then(() => {
				const node = conn.getNode(nodeID);
				conn.nodeSubscription().publish('UPDATED', node);
				resolve(node);
			}, reject);
	});
};

export default updateNode;
