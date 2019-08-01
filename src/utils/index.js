import chalk from 'chalk';

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
 * @summary It writes a message to the console with the appropriate label and color.
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
 * @summary It indicates the environment type where the hub is running.
 * @returns true if it is running in a developer environment, false otherwise.
 */
export const isDev = () => {
	if (!process.env.NODE_ENV) {
		return true;
	} else {
		return process.env.NODE_ENV === 'development';
	}
};
