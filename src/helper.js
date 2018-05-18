'use strict';
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const debug = require('debug')('adb:helper');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
const highlightErrors = process.env['ADB_HIGHLIGHT_ERRORS'] || true;
const rainbowMode = process.env['ADB_RAINBOW'] || false;
const moreLogging = process.env['TOOL_LOGGING'] || false;
const errorRegex = new RegExp('error:', 'i');

const ToolUrlMap = {
	adb:{
		WINDOWS: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
		LINUX: 'https://dl.google.com/android/repository/platform-tools-latest-linux.zip',
		OSX: 'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip'
	},
	gradle:{
		WINDOWS:'https://services.gradle.org/distributions/gradle-4.7-bin.zip',
		LINUX:'https://services.gradle.org/distributions/gradle-4.7-bin.zip',
		OSX:'https://services.gradle.org/distributions/gradle-4.7-bin.zip'
	}
}
const packageJson = require('../package.json');

function getOSUrl(toolName) {
	const urls = ToolUrlMap[toolName || 'adb'];
	const currentOS = os.platform();
	debug('Getting android SDK for platform: ' + currentOS);
	switch (currentOS) {
	case 'win32':
		return urls.WINDOWS;
	case 'darwin':
		return urls.OSX;
	case 'linux':
		return urls.LINUX;
	default:
		console.log(`Using undefined OS of ${currentOS} ,defaulting to linux`);
		return urls.LINUX;
	}
}

function getUserAgent() {
	const nodeString = `NodeJs/${process.version}`;
	const packageString = `${packageJson.name}/${packageJson.version}`;
	const computerString = `Hostname/${os.hostname()} Platform/${os.platform()} PlatformVersion/${os.release()}`;
	return `${packageString} ${nodeString} ${computerString}`;
}

function getExecutablebyOS(name) {
	if(!name){
		throw new Error('getExecutablebyOS needs a name param');
	}
	const currentOS = os.platform();
	switch (currentOS) {
	case 'win32':
		return `${name}.exe`;
	case 'darwin':
		return `${name}`;
	case 'linux':
		return `${name}`;
	default:
		console.log(`Using unknown OS of ${currentOS} ,defaulting to linux`);
		return LINUX_URL;
	}
}

function getToolPaths(platformToolsDirName) {
	if (!platformToolsDirName) {
		platformToolsDirName = 'platform-tools';
	}
	const adbBinary = getExecutablebyOS('adb');
	const fastBootBinary = getExecutablebyOS('fastboot');
	const dmtracedumpBinary = getExecutablebyOS('dmtracedump');
	const etc1toolBinary = getExecutablebyOS('etc1tool');
	const hprofconvBinary = getExecutablebyOS('hprof-conv');
	const sqlite3Binary = getExecutablebyOS('sqlite3');
	const adbPath = path.resolve(__dirname, '..', platformToolsDirName, adbBinary);
	const fasbootPath = path.resolve(__dirname, '..', platformToolsDirName, fastBootBinary);
	const dmtracedumpPath = path.resolve(__dirname, '..', platformToolsDirName, dmtracedumpBinary);
	const etc1toolPath = path.resolve(__dirname, '..', platformToolsDirName, etc1toolBinary);
	const hprofconvPath = path.resolve(__dirname, '..', platformToolsDirName, hprofconvBinary);
	const sqlite3Path = path.resolve(__dirname, '..', platformToolsDirName, sqlite3Binary);
	const platformToolsPath = path.resolve(__dirname, '..', platformToolsDirName);
	return fs.pathExists(adbPath).then((exists) => {
		if (exists === true) {
			return {
				adbPath,
				platformToolsPath,
				fasbootPath,
				dmtracedumpPath,
				etc1toolPath,
				hprofconvPath,
				sqlite3Path
			};
		} else {
			return null;
		}
	});
}

function logRawLine(line) {
	process.stdout.write(line);
}

function lineLoggerMap(line) {
	if (line.length > 0) {
		if (rainbowMode) {
			let randomInt = Math.floor(Math.random() * colors.length);
			let info = chalk[colors[randomInt]];
			process.stdout.write(info(line));
		} else if (highlightErrors) {
			if (errorRegex.test(line)) {
				let error = chalk['red'];
				process.stdout.write((error(line)));
			} else {
				logRawLine(line);
			}
		} else {
			logRawLine(line);
		}
	}
}

function stdoutToLines(stdout) {
	let stdoutString = stdout.toString();
	stdoutString.split('\r').map(lineLoggerMap);
}


function spawnProcess(path, userArgs) {
	let spawnOptions = {};
	if (spawnOptions.inherit) {
		spawnOptions.stdio = 'inherit';
	}
	spawnOptions.stdio = 'inherit';
	let toolProcess = spawn(path, userArgs, {stdio: ['inherit', null, 'inherit']});
	if(moreLogging) {
		console.log(`${path} ${userArgs}`);
	}
	toolProcess.on('error', (err) => {
		console.error(`Failed to start child process. ${err}`);
		process.exit(1);
	});
	toolProcess.stdout.on('data', (data) => {
		stdoutToLines(data);
	});
}

module.exports.checkSdkExists = (toolPath) => {
	const toolDir = path.resolve(__dirname, '..', toolPath);
	return fs.pathExists(toolDir).then((exists) => {
		return exists === true;
	});
};

module.exports.getToolPaths = getToolPaths;
module.exports.getOSUrl = getOSUrl;
module.exports.getExecutablebyOS = getExecutablebyOS;
module.exports.getUserAgent = getUserAgent;
module.exports.spawnProcess = spawnProcess;