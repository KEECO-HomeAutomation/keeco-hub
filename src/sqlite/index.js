import fs from 'fs';
import path from 'path';
import SQLite from 'sqlite3';
import chalk from 'chalk';

import { log } from '../utils';

import populate from './populate';

class Db {
	//initialize database
	init(file, callback) {
		//check if DB is set up already
		let dbExists = fs.existsSync(path.join(process.cwd(), file));

		this.db = new SQLite.Database(
			file,
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
					//if database doesn't existed, populate it
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

					//turn on foreign keys
					this.db.exec('PRAGMA foreign_keys=ON');

					callback();
				}
			}
		);
	}

	run(sql, param, cb) {
		this.db.run(sql, param, cb);
	}

	get(sql, param, cb) {
		this.db.get(sql, param, cb);
	}

	all(sql, param, cb) {
		this.db.all(sql, param, cb);
	}

	each(sql, param, cb) {
		this.db.each(sql, param, cb);
	}

	exec(sql, cb) {
		this.db.exec(sql, cb);
	}
}

const db = new Db();

export default db;
