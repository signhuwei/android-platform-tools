#!/usr/bin/env node
'use strict';
const helper = require('./helper');
const userArgs = process.argv.slice(2); //drop node and .js file
const adb = require('../index');

helper.getToolPaths('gradle47').then((resolvedPaths) => {
	if (resolvedPaths !== null) {
		helper.spawnProcess(resolvedPaths.gradle47Path, userArgs);
	} else {
		console.log('Did not find local platform-tools: gradle');
		return adb.downloadAndReturnToolPaths('gradle47').then((paths) => {
			console.log(`Platform tools downloaded to: ${paths.platformToolsPath}`);
			if (paths.gradle47Path !== null) {
				helper.spawnProcess(paths.gradle47Path, userArgs);
			} else {
				console.error(`encountered unknown error,exiting... ${JSON.stringify(paths)}}`);
				process.exit(1);
			}
		});
	}
});
