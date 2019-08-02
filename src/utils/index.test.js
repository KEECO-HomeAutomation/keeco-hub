import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { log, isDev, getConfigFile } from './index';

describe('utils', () => {
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

	describe('getConfigFile', () => {
		test('Should check if config dir exists', () => {
			fs.existsSync = jest.fn().mockReturnValue(true);
			getConfigFile('asd');
			expect(fs.existsSync).toBeCalled();
		});

		test('Should create config dir if it does not exist', () => {
			fs.existsSync = jest.fn().mockReturnValue(false);
			fs.mkdirSync = jest.fn();
			getConfigFile('asd');
			expect(fs.mkdirSync).toBeCalledTimes(1);
			expect(fs.mkdirSync).toBeCalledWith(path.join(process.cwd(), 'config'));
		});

		test('If config dir exists, should not create it', () => {
			fs.existsSync = jest.fn().mockReturnValue(true);
			fs.mkdirSync = jest.fn();
			getConfigFile('asd');
			expect(fs.mkdirSync).not.toBeCalled();
		});

		test('It should return an object with a path and the exists switch', () => {
			fs.existsSync = jest.fn().mockReturnValue(true);
			expect(getConfigFile('config.conf')).toMatchObject({
				path: path.join(process.cwd(), 'config', 'config.conf'),
				exists: true
			});
		});

		test('Shoukd set exists prop accordingly', () => {
			fs.existsSync = jest
				.fn()
				.mockReturnValueOnce(true)
				.mockReturnValue(false);
			expect(getConfigFile('config.conf')).toMatchObject({
				path: path.join(process.cwd(), 'config', 'config.conf'),
				exists: false
			});
		});
	});
});
