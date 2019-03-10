import PasswordHash from 'password-hash';

const updateUser = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'UPDATE users SET password=$passwd WHERE id=$id',
			{ $id: id, $passwd: PasswordHash.generate(options.password) },
			err => {
				if (err) {
					reject(err);
				} else {
					resolve(conn.getUser(id));
				}
			}
		);
	});
};

export default updateUser;
