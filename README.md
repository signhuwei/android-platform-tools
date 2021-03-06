# android-platform-tools #

[![Build Status](https://travis-ci.org/jamie-sherriff/android-platform-tools.svg?branch=master)](https://travis-ci.org/jamie-sherriff/android-platform-tools)
[![Build status](https://ci.appveyor.com/api/projects/status/xxa5h7vtrgvra895?svg=true)](https://ci.appveyor.com/project/jamie-sherriff/android-platform-tools)
[![Dependency Status](https://david-dm.org/jamie-sherriff/android-platform-tools.svg)](https://david-dm.org/jamie-sherriff/android-platform-tools)
[![devDependency Status](https://david-dm.org/jamie-sherriff/android-platform-tools/dev-status.svg)](https://david-dm.org/jamie-sherriff/android-platform-tools#info=devDependencies)

This is a fully self contained module that wraps the Android SDK platform tools

This grabs the latest SDK Platform tools from https://developer.android.com/studio/releases/platform-tools.html

Fully multi platform and tested on windows, Linux and Mac OS. Please let me know if your OS does not work.

It will Also store the Android platform tools locally and check it exists at runtime so it does not download each time.

## Requirements ##
* NodeJs 6+ recommended NodeJs 4 should also work

## Command Line Interface Usage ##
* `npm install -g android-platform-tools` 
* This provides an alias for adb `adbn <any adb command here>` or  `adb <any adb command here>` 
* For example: `adbn devices` or `adb devices`  
 Returns the usual: `List of devices attached`
* `adbn` to avoid path conflicts with any existing android sdk installation with adb
* Version 1.0.0+ Now provides aliases for fastboot, etc1tool, dmtracedump, hprof-conv and sqlite3
* As with adb they have their respective n suffixes (fastbootn, etc1tooln, dmtracedumpn, hprof-convn and sqlite3n)

 
## CLI Customisation ##
 The following environment variables are available
 
 * ADB_HIGHLIGHT_ERRORS (Highlights the word error in stdout in red)
 * ADB_RAINBOW (Makes each line in stdout a different color and windows environment friendly)

## Programmatic Usage ##
~~~~

const adb = require('android-platform-tools');
  
//downloadOnly
return adb
    .downloadTools()
    .then((tools) => {
        const toolsPath = tools.path;
    });
//downloadWithValidationAndPaths
return adb
    .downloadAndReturnToolPaths()
    .then((tools) => {
        const adbPath = tools.adbPath;
        const platformToolsPath = tools.platformToolsPath;
    });
~~~~

With Version 1.0.0 downloadAndReturnToolPaths now returns an object with the following properties:
~~~
adbPath
platformToolsPath
fasbootPath
dmtracedumpPath
etc1toolPath
hprofconvPath
sqlite3Path
~~~


## Contributions ##
* Always welcome 

## Roadmap ##
* more customisation of the platform tools path, currently defaults to __dirname and "platform-tools"
* Also consult TODO.txt

## TroubleShooting ##
* EACCESS errors on unix: `Error: EACCES: permission denied`
  https://docs.npmjs.com/getting-started/fixing-npm-permissions
* Be careful with option one because doing a chown on usr/bin can override the sudo command on unix systems
* `EPERM: operation not permitted, unlink 'C:%HOMEPATH%\AppData\Roaming\npm\node_modules\android-platform-tools\platform-tools\AdbWinApi.dll'` On windows
to, to fix it means adb is still running try a `adb kill-server`

## Known Issues ##
* `adb shell` is a bit sluggish for input and will look into this
* Please add any issues you find to github

### Running Tests ###
* `npm test`

### Checking code style ###
* `npm run lint`

### Contributing guidelines ###
* Write tests
* Check linting
* Do a Pull request

### Legal ###
* By using this module you agree to any terms and conditions outlined by Google,
documented in the NOTICE.txt under the platform tools installation

### Any Questions? ###
* Feel free to contact me on github