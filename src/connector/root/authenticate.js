const authenticate = (conn, token) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT user AS uid, username FROM auth_tokens AS at INNER JOIN users AS u ON (u.id=at.user) WHERE at.token=$token and invalidated=0',
				{ $token: token }
			)
			.then(row => {
				if (row) {
					resolve({ ...row, token });
				} else {
					resolve(null);
				}
			}, reject);
	});
};

export default authenticate;
