import PasswordHash from 'password-hash';

const createUser = (conn, options) => {
	return new Promise((resolve, reject) => {
		//check for duplicate username
		conn.db
			.all('SELECT id AS count FROM users WHERE username=$uname', {
				$uname: options.username
			})
			.then(rows => {
				if (rows.length) {
					resolve(null);
				} else {
					conn.db
						.run(
							'INSERT INTO users (username, password) VALUES ($uname, $passwd)',
							{
								$uname: options.username,
								$passwd: PasswordHash.generate(options.password)
							}
						)
						.then(res => {
							const user = { ...options, id: res.lastID };
							conn
								.userSubscription()
								.publish('CREATED', { ...user, password: undefined });
							resolve(user);
						}, reject);
				}
			}, reject);
	});
};

export default createUser;
