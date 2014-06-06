/*
 * grunt-msdeploy
 * https://github.com/mrjackdavis/grunt-msdeploy
 *
 * Copyright (c) 2014 mrjackdavis
 * Licensed under the MIT license.
 */

 'use strict';

 var spawn = require('child_process').spawn;
 var path = require('path');
 var fs = require('fs');

 module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('msdeploy', 'The best msdeploy Grunt plugin ever.', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      msdeployPath: getExePath(),
      verb:"sync",
      deployType:"package",
      sourceType:"iisApp"
    });

    //Assertions
    grunt.log.debug(this.filesSrc.length);

    if(this.filesSrc.length>1){
      grunt.log.warn('only support one src location');
      return false;
    }else if(this.filesSrc.length<1){
      grunt.log.warn('must have at least one src location');
      return false;
    }else if(!grunt.file.isDir(this.filesSrc[0])) {
      grunt.log.warn('Source file "' + this.filesSrc[0] + '" is not directory.');
      return false;
    }
    var srcPath = this.filesSrc[0];
    if(!grunt.file.isPathAbsolute(srcPath))
      srcPath = path.resolve(srcPath)

    //Make dir for dist if need be
    var dest = this.files[0].dest
    var destDir = dest.substr(0, Math.max(dest.lastIndexOf("/"),dest.lastIndexOf("\\")));
    if(!grunt.file.isDir(destDir)) {
      grunt.file.mkdir(destDir);
      grunt.log.debug("Created directory \""+destDir+"\"")
    }

    //Build args
    //Source

    var args = [];

    args.push("-verb:"+options.verb);
    args.push("-source:"+options.sourceType+"="+srcPath);
    args.push("-dest:"+options.deployType+"="+dest);

    grunt.log.debug(options.msdeployPath);
    grunt.log.debug(args);


    //Execute Process
    var done = this.async();

    var process = spawn(options.msdeployPath,args);

    process.stdout.on('data', function(data) { 
        grunt.log.write(data);
    });
    process.stderr.on('data', function(data) {
      grunt.log.error(data);
    });
    process.on('exit', function(code) {
      if (code !== 0) {
        grunt.fail.warn('Something went wrong');
      }else{
        grunt.log.ok("Deploy succeeded !");
      }
      done();
    });
  });

function getExePath() {

  var relativeMsDeployPath = "IIS/Microsoft Web Deploy V3/msdeploy.exe";
  var msDeploy64Path = path.resolve(path.join(process.env.ProgramFiles,relativeMsDeployPath));
  var msDeploy32Path = path.resolve(path.join(process.env["ProgramFiles(x86)"],relativeMsDeployPath));

  if (fs.existsSync(msDeploy64Path)) {
    return msDeploy64Path;
  }

  if (fs.existsSync(msDeploy32Path)) {
    return msDeploy64Path;
  }

  throw new Error("MSDeploy doesn't seem to be installed. Could not find msdeploy in \""+msDeploy64Path+"\" or \""+msDeploy32Path+"\". You can install it from http://www.iis.net/downloads/microsoft/web-deploy")
}
};