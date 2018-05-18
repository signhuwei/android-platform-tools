#!/usr/bin/env node
'use strict';
const helper = require('./helper');
const userArgs = process.argv.slice(2); //drop node and .js file
const adb = require('../index');

helper.getToolPaths('adb').then((resolvedPaths) => {
	if (resolvedPaths !== null) {
		helper.spawnProcess(resolvedPaths.adbPath, userArgs);
	} else {
		console.log('Did not find local platform-tools: adb');
		return adb.downloadAndReturnToolPaths('adb').then((paths) => {
			console.log(`Platform tools downloaded to: ${paths.platformToolsPath}`);
			if (paths.adbPath !== null) {
				helper.spawnProcess(paths.adbPath, userArgs);
			} else {
				console.error(`encountered unknown error,exiting... ${JSON.stringify(paths)}}`);
				process.exit(1);
			}
		});
	}
});
