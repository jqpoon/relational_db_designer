/**
 * Remove old files, copy front-end ones.
 */

import fs from "fs-extra";
import Logger from "jet-logger";
import childProcess from "child_process";

// Setup logger
const logger = new Logger();
logger.timestamp = false;

// Build backend
(async () => {
	try {
		// Remove current build
		await remove("./dist/");
		// Copy swagger config files
		await copy("./src/config", "./dist/config");
		// Build backend
		await exec("tsc --build tsconfig.prod.json", "./");
	} catch (err) {
		logger.err(err);
	}
})();

// Utility functions to copy/remove folders and to execute commands
function remove(loc: string): Promise<void> {
	return new Promise((res, rej) => {
		return fs.remove(loc, (err) => {
			return !!err ? rej(err) : res();
		});
	});
}

function copy(src: string, dest: string): Promise<void> {
	return new Promise((res, rej) => {
		return fs.copy(src, dest, (err) => {
			return !!err ? rej(err) : res();
		});
	});
}

function exec(cmd: string, loc: string): Promise<void> {
	return new Promise((res, rej) => {
		return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
			if (!!stdout) {
				logger.info(stdout);
			}
			if (!!stderr) {
				logger.warn(stderr);
			}
			return !!err ? rej(err) : res();
		});
	});
}
