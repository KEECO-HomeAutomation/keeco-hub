import fs from 'fs';
import path from 'path';
import SQLite from 'sqlite3';
import chalk from 'chalk';

import { log, isDev } from '../utils';
import populate from './populate';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module sqlite/index
 * @summary Handle the database connection and its operations.
 */

if (isDev()) {
	SQLite.verbose();
}

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @class Db
 * @summary Handle the database connection and its operations.
 */
class Db {
	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method init
	 * @param {file} file - A file.
	 * @param {function} callback - A callback function.
	 * @summary Initalize the database in a file. If the file doesn't exist, create one.
	 */
	init(file, callback) {
		if (!fs.existsSync(path.join(process.cwd(), 'config'))) {
			fs.mkdirSync(path.join(process.cwd(), 'config'));
		}
		let dbExists = fs.existsSync(path.join(process.cwd(), 'config', file));

		this.db = new SQLite.Database(
			path.join(process.cwd(), 'config', file),
			SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
			error => {
				if (error) {
					log(
						'SQLite',
						'Error during opening ' + chalk.gray(file) + '. Error: ' + error,
						'error'
					);
					process.exit(1);
				} else {
					if (!dbExists) {
						log('SQLite', 'Populating database');
						populate(db, error => {
							if (error) {
								log(
									'SQLite',
									'Error during populating database. Error: ' + error,
									'error'
								);
								process.exit(1);
							} else {
								log('SQLite', 'Database successfully populated');
							}
						});
					}

					this.db.exec('PRAGMA foreign_keys=ON');

					callback();
				}
			}
		);
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method close
	 * @summary Close the database connection.
	 */
	close() {
		return new Promise((resolve, reject) => {
			log('SQLite', 'Closing database', 'message');
			this.db.close(error => {
				if (error) {
					log('SQLite', 'Failed to close database. Error: ' + error, 'error');
					reject(error);
				} else {
					log('SQLite', 'Database closed', 'message');
					resolve();
				}
			});
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method run
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @param {function} cb - A callback function.
	 * @summary TODO
	 */
	run(sql, param, cb) {
		this.db.run(sql, param, cb);
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method get
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @param {function} cb - A callback function.
	 * @summary TODO
	 */
	get(sql, param, cb) {
		this.db.get(sql, param, cb);
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method all
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @param {function} cb - A callback function.
	 * @summary TODO
	 */
	all(sql, param, cb) {
		this.db.all(sql, param, cb);
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method each
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @param {function} cb - A callback function.
	 * @summary TODO
	 */
	each(sql, param, cb) {
		this.db.each(sql, param, cb);
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method exec
	 * @param {string} sql - An SQL command.
	 * @param {function} cb - A callback function.
	 * @summary TODO
	 */
	exec(sql, cb) {
		this.db.exec(sql, cb);
	}
}

const db = new Db();

export default db;
