import PasswordHash from 'password-hash';
import RandToken from 'rand-token';

const login = (conn, username, password) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT id, username, password FROM users WHERE username=$uname',
			{ $uname: username },
			(err, row) => {
				if (err) {
					reject(err);
				}

				if (row) {
					if (PasswordHash.verify(password, row.password)) {
						let token = RandToken.generate(32);
						conn.db.run(
							'INSERT INTO auth_tokens (user, token) VALUES ($uid, $token)',
							{ $uid: row.id, $token: token },
							err => {
								if (err) {
									reject(err);
								} else {
									resolve({ token });
								}
							}
						);
					} else {
						resolve(null);
					}
				} else {
					resolve(null);
				}
			}
		);
	});
};

export default login;
