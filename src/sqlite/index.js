import fs from 'fs';
import path from 'path';
import SQLite from 'sqlite3';
import chalk from 'chalk';

import { log } from '../utils';

import populate from './populate';

let db;

//initialize database
export const initDB = (file, callback) => {
	//check if DB is set up already
	let dbExists = fs.existsSync(path.join(process.cwd(), file));

	db = new SQLite.Database(
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

				callback();
			}
		}
	);
};

export default db;
