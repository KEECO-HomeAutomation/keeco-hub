import chalk from 'chalk';

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
			tag = chalk.bgWhite('INFO');
	}

	console.log(chalk.bgCyan(domain) + chalk.bold(' -> ') + tag + ' ' + message);
};
