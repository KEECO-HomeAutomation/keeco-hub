import chalk from 'chalk';
import { log } from './index';

describe('log', () => {
	var types = [
		undefined,
		'message',
		'error',
		'warning',
		'info',
		'ProbablyNotExistingType'
	];
	types.forEach(testCase => {
		test('Type=' + testCase, () => {
			console.log = jest.fn();
			log('domain', 'message', testCase);
			let tag;
			switch (testCase) {
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
			expect(console.log).toBeCalledWith(
				chalk.bgCyan('domain') + chalk.bold(' -> ') + tag + ' ' + 'message'
			);
		});
	});
});
