import SQLite from 'sqlite3';
import chalk from 'chalk';

import { log, getConfigFile } from '../utils';
import populate from './populate';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module sqlite/index
 * @summary Handle the database connection and its operations.
 */

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
	 * @summary Initalize the database in a file. If the file doesn't exist, create one.
	 */
	init(fileName) {
		return new Promise((resolve, reject) => {
			let file = getConfigFile(fileName);
			this.db = new SQLite.Database(
				file.path,
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (error) {
						log(
							'SQLite',
							'Error during opening ' + chalk.gray(file) + '. Error: ' + error,
							'error'
						);
						reject(error);
					} else {
						//if database doesn't existed, populate it
						if (!file.exists) {
							log('SQLite', 'Populating database');
							populate(db).then(
								() => {
									log('SQLite', 'Database successfully populated');
									//turn on foreign keys
									this.exec('PRAGMA foreign_keys=ON').then(resolve, reject);
								},
								error => {
									log(
										'SQLite',
										'Error during populating database. Error: ' + error,
										'error'
									);
									reject(error);
								}
							);
						}
					}
				}
			);
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method initTest
	 * @summary Initalize database for testing.
	 */
	initTest() {
		return new Promise((resolve, reject) => {
			this.db = new SQLite.Database(
				':memory:',
				SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
				error => {
					if (error) {
						reject(error);
					} else {
						populate(db).then(() => {
							this.exec('PRAGMA foreign_keys=ON').then(resolve, reject);
						}, reject);
					}
				}
			);
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method close
	 * @param {bool=true} logging - Turn logging on/off.
	 * @summary Close the database connection.
	 */
	close(logging = true) {
		return new Promise((resolve, reject) => {
			if (this.db === undefined) {
				resolve();
			} else {
				if (logging) {
					log('SQLite', 'Closing database', 'message');
				}
				this.db.close(error => {
					if (error) {
						if (logging) {
							log(
								'SQLite',
								'Failed to close database. Error: ' + error,
								'error'
							);
						}
						reject(error);
					} else {
						if (logging) {
							log('SQLite', 'Database closed', 'message');
						}
						this.db = undefined;
						resolve();
					}
				});
			}
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method run
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @summary TODO
	 */
	run(sql, param) {
		return new Promise((resolve, reject) => {
			this.db.run(sql, param, function(err, res) {
				if (err) {
					reject(err);
				} else {
					resolve({ lastID: this.lastID, res });
				}
			});
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method get
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @summary TODO
	 */
	get(sql, param) {
		return new Promise((resolve, reject) => {
			this.db.get(sql, param, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method all
	 * @param {string} sql - An SQL command.
	 * @param {*} param - Parameters of the SQL command.
	 * @summary TODO
	 */
	all(sql, param) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, param, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	}

	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @method exec
	 * @param {string} sql - An SQL command.
	 * @summary TODO
	 */
	exec(sql) {
		return new Promise((resolve, reject) => {
			this.db.exec(sql, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	}
}

const db = new Db();

export default db;
