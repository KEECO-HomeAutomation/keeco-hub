import PasswordHash from 'password-hash';
import RandToken from 'rand-token';

const login = (conn, username, password) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT id, username, password FROM users WHERE username=$uname', {
				$uname: username
			})
			.then(row => {
				if (row) {
					if (PasswordHash.verify(password, row.password)) {
						let token = RandToken.generate(32);
						conn.db
							.run(
								'INSERT INTO auth_tokens (user, token) VALUES ($uid, $token)',
								{ $uid: row.id, $token: token }
							)
							.then(() => {
								resolve({ token });
							}, reject);
					} else {
						resolve(null);
					}
				} else {
					resolve(null);
				}
			}, reject);
	});
};

export default login;
