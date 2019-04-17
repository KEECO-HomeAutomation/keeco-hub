import PasswordHash from 'password-hash';

const updateUser = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db.get(
			'SELECT COUNT(id) AS count FROM users WHERE id=$id',
			{ $id: id },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row.count === 0) {
						resolve(null);
					} else {
						conn.db.run(
							'UPDATE users SET password=$passwd WHERE id=$id',
							{ $id: id, $passwd: PasswordHash.generate(options.password) },
							err => {
								if (err) {
									reject(err);
								} else {
									let user = conn.getUser(id);
									conn.userSubscription().publish('UPDATED', user);
									resolve(user);
								}
							}
						);
					}
				}
			}
		);
	});
};

export default updateUser;
