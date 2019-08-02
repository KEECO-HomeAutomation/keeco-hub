import SQLite from 'sqlite3';
import chalk from 'chalk';

import { log, getConfigFile } from '../utils';

import populate from './populate';

class Db {
	//initialize database
	init(file) {
		return new Promise((resolve, reject) => {
			let file = this.getFile(file);
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

	//initialize database for testing
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

	//close database
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
