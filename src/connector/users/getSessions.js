const getSessions = (conn, uid) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all('SELECT issued, invalidated FROM auth_tokens WHERE user=$uid', {
				$uid: uid
			})
			.then(rows => {
				resolve(rows.map(row => ({ ...row, invalidated: !!row.invalidated })));
			}, reject);
	});
};

export default getSessions;
