import PasswordHash from 'password-hash';
import GetUser from './getUser';

const updateUser = (conn, id, options) => {
	return new Promise((resolve, reject) => {
		conn.db.run(
			'UPDATE users SET password=$passwd WHERE id=$id',
			{ $id: id, $passwd: PasswordHash.generate(options.password) },
			err => {
				if (err) {
					reject(err);
				} else {
					resolve(GetUser(conn, id));
				}
			}
		);
	});
};

export default updateUser;
