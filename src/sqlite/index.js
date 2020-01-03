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
 * @summary Handle the database connection and its operations.
 */
class Db {
	/**
	 * @author Gergő Fándly <gergo@systemtest.tk>
	 * @summary Initalize the database in a file. If the file doesn't exist, create one.
	 * @param {file} fileName - A filename relative to the config folder
	 */
	init(fileName) {
		return new Promise((resolve, reject) => {
			const file = getConfigFile(fileName);
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
	 * @summary Initalize database in memory for testing.
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
	 * @summary Close the database connection.
	 * @param {bool} [logging=true] - Turn logging on/off.
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
	 * @summary Run an SQL query without getting results.
	 * @param {string} sql - An SQL query
	 * @param {Object<string, string|number|boolean>} param - SQL parameters
	 * @returns {Promise<Object<string, string|number|boolean>>} A promise containing lastID (last inserted ID to the database)
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
	 * @summary Run an SQL query and get a single row as result.
	 * @param {string} sql - An SQL query
	 * @param {Object<string, string|number|boolean>} param - SQL parameters
	 * @returns {Promise<Object<string, string|number|boolean>>} A promise containing the result row
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
	 * @summary Run an SQL query and get all the rows as an array
	 * @param {string} sql - An SQL query
	 * @param {Object<string, string|number|boolean>} param - SQL parameters
	 * @returns {Promise<Object<string, string|number|boolean>>} A promise containing an array of objects representing the result set
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
	 * @summary Execute any SQL string (can contain multiple queries separated by ;). No comments allowed.
	 * @param {string} sql - An SQL string
	 * @returns {Promise} An empty promise
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
