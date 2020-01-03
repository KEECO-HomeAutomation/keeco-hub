const logout = (conn, token) => {
	return new Promise((resolve, reject) => {
		conn.db
			.run('UPDATE auth_tokens SET invalidated=1 WHERE token=$token', {
				$token: token
			})
			.then(() => {
				resolve({ token });
			}, reject);
	});
};

export default logout;
