import PasswordHash from 'password-hash';

const updateUser = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get('SELECT COUNT(id) AS count FROM users WHERE id=$id', { $id: id })
			.then(row => {
				if (row.count === 0) {
					resolve(null);
				} else {
					conn.db
						.run('UPDATE users SET password=$passwd WHERE id=$id', {
							$id: id,
							$passwd: PasswordHash.generate(options.password)
						})
						.then(() => {
							const user = conn.getUser(id);
							conn.userSubscription().publish('UPDATED', user);
							resolve(user);
						}, reject);
				}
			}, reject);
	});
};

export default updateUser;
