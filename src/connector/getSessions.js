const getSessions = (conn, uid) => {
	return new Promise((resolve, reject) => {
		conn.db.all(
			'SELECT issued, invalidated FROM auth_tokens WHERE user=$uid',
			{ $uid: uid },
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(
						rows.map(row => ({ ...row, invalidated: !!row.invalidated }))
					);
				}
			}
		);
	});
};

export default getSessions;
