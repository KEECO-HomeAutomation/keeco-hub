const provision=(conn, prov) => {
	return new Promise((resolve, reject) => {
		//check if node already exists
		conn.db.all('SELECT id FROM nodes WHERE uuid=$uuid', {$uuid: prov.uuid}, (err, rows) => {
			if(err){
				reject(err);
			}
			else{
				if(rows.length>0){
					resolve(false);
				}
				else{
					try{
						addNode(conn, prov);
					}
					catch(e){
						reject(e);
					}
					resolve(true);
				}
			}
		})
	})
}

const addNode=(conn, prov)=> {
	//insert node
	conn.db.run('INSERT INTO nodes (uuid, name) VALUES ($uuid, $name)', {$uuid: prov.uuid, $name: prov.name}, function(err){
		if(err){
			throw err;
		}

		var nodeID=this.lastID;

		//insert endpoints
		prov.endpoints.each((endpoint) => {
			conn.db.run('INSERT INTO node_endpoints')
		})
	})
}