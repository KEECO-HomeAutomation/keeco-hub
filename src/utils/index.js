import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module utils/index
 */

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function log
 * @param {string} domain - Where the event happens.
 * @param {string} message - The message what you want to write to the console.
 * @param {string} [type='info'] - The type of the message. Possible values: 'message', 'error', 'warning'.
 * @summary Write a message to the console with the appropriate label and color.
 */
export const log = (domain, message, type = 'info') => {
	let tag = '';
	switch (type) {
		case 'message':
			tag = chalk.bgGreen('MSG');
			break;
		case 'error':
			tag = chalk.bgRed('ERROR');
			break;
		case 'warning':
			tag = chalk.bgYellow('WARN');
			break;
		default:
			tag = chalk.bgWhite.black('INFO');
	}

	console.log(chalk.bgCyan(domain) + chalk.bold(' -> ') + tag + ' ' + message);
};

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function isDev
 * @summary Indicate the environment type where the hub is running.
 * @returns true if it is running in a developer environment, false otherwise.
 */
export const isDev = () => {
	if (!process.env.NODE_ENV) {
		return true;
	} else {
		return process.env.NODE_ENV === 'development';
	}
};

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function getConfigFile
 * @summary Gets the full path of a config file and tells if it exists
 * @param {string} file - The name of the config file
 * @returns {{path: string, exists: boolean}} configFile
 */
export const getConfigFile = file => {
	const filepath = path.join(process.cwd(), 'config', file);

	//check if config folder exists. If not, create
	if (!fs.existsSync(path.join(process.cwd(), 'config'))) {
		fs.mkdirSync(path.join(process.cwd(), 'config'));
	}

	const exists = fs.existsSync(filepath);

	return { path: filepath, exists };
};
