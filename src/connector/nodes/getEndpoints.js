const getEndpoints = (conn, nodeID, nodeUUID) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all(
				'SELECT id, name, output, range FROM node_endpoints WHERE node=$node',
				{ $node: nodeID }
			)
			.then(rows => {
				var result = rows.map(row => {
					return {
						...row,
						output: row.output === 1,
						value: conn.mqtt.store.get('nodes/' + nodeUUID + '/' + row.name)
							.value
					};
				});
				resolve(result);
			}, reject);
	});
};

export default getEndpoints;
