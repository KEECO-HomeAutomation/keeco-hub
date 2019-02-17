import chalk from 'chalk';
import { log, isDev } from './index';

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
					tag = chalk.bgWhite.black('INFO');
			}
			expect(console.log).toBeCalledWith(
				chalk.bgCyan('domain') + chalk.bold(' -> ') + tag + ' ' + 'message'
			);
		});
	});
});

describe('isDev', () => {
	var tests = [
		{
			env: 'development',
			expect: true
		},
		{
			env: '',
			expect: true
		},
		{
			env: 'production',
			expect: false
		},
		{
			env: 'NotExistingEnv',
			expect: false
		}
	];
	const OldEnv = process.env;

	afterEach(() => {
		process.env = OldEnv;
	});

	tests.forEach(testCase => {
		test(
			'Env=' + testCase.env + ' response should be ' + testCase.expect,
			() => {
				process.env.NODE_ENV = testCase.env;
				expect(isDev()).toBe(testCase.expect);
			}
		);
	});
});
