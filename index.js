'use strict';
const helper = require('./src/helper');
const fs = require('fs-extra');
const path = require('path');
const debug = require('debug')('adb:index');
const request = require('request');
const ProgressBar = require('progress');
const extract = require('extract-zip');
const zipCache = process.env['ADB_ZIP_CACHE'] || null;

//TODO add a option useLocalZip
function downloadTools(toolDirName,tname) {
	return new Promise((resolve, reject) =>{
		const androidToolZipPath = path.join(__dirname, 'android-sdk.zip');
		const extractPath = tname == "gradle47" ? path.join(__dirname, toolDirName) : __dirname;
		const toolDir = tname == "gradle47" ? path.join(extractPath, 'gradle-4.7') : path.join(extractPath, toolDirName);
		const downloadUrl = helper.getOSUrl(tname);
		console.log(`Downloading Android platform tools from: ${downloadUrl}`);
		const requestOptions = {timeout: 30000, 'User-Agent': helper.getUserAgent()};
		request(downloadUrl, requestOptions)
			.on('error', (error)  => {
				debug(`Request Error ${error}`);
				reject(error);
			})
			.on('response', (response)  => {
				const len = parseInt(response.headers['content-length'], 10);
				let bar = new ProgressBar('  downloading [:bar] :percent :etas', {
					complete: '=',
					incomplete: ' ',
					width: 20,
					total: len
				});

				response.on('data', function (chunk) {
					if (chunk.length){
						bar.tick(chunk.length);
					}
				});

				response.on('end', function () {
					console.log('\n');
				});
				debug(response.statusCode);
				debug(response.headers['content-type']);
			})
			.pipe(fs.createWriteStream(androidToolZipPath))
			.on('finish', ()  => {
				debug('wstream finished');
				console.log('Extracting Android SDK');
				extract(androidToolZipPath, {dir: extractPath},(error) =>{
					if(error){
						debug(`Extraction failed: ${error}`);
						reject(error);
					} else{
						console.log('Extraction complete');
						debug('downloadSDK complete');
						if(zipCache !== null){
							resolve({path:toolDir, message:'downloadSDK complete', zipPath:androidToolZipPath});
							return;
						}
						fs.remove(androidToolZipPath, err => {
							if (err) {
								console.error(`removing zip file failed: ${err}`);
								reject(err);
							} else {
								console.log('Removed platform-tools zip file, please specify ADB_ZIP_CACHE if you wish to keep it');
								resolve({path:toolDir, message:'downloadSDK complete'});
							}
						});
					}
				});
			});
	});
}

function downloadAndReturnToolPaths(tname) {
	const toolPath = 'platform-tools';
	
	return downloadTools(toolPath,tname)
		.then((platformTools) => {
			return helper.checkSdkExists(platformTools.path);
		})
		.then((exists) => {
			if (exists === true) {
				return helper.getToolPaths(tname);
			} else {
				console.error('something went wrong');
				return exists;
			}
		});
}

module.exports.downloadAndReturnToolPaths = downloadAndReturnToolPaths;
module.exports.downloadTools = downloadTools;