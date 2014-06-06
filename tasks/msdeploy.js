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
      args:{
        verb:"sync"
      },
      src:{
        type:"iisApp",
        args:{}
      },
      dest:{
        type:"package",
        args:{}
      }
    });

    //Assertions
    verifyLocationForType(this.filesSrc,options.src.type);

    var srcPath = this.filesSrc[0];
    if(!grunt.file.isPathAbsolute(srcPath))
      srcPath = path.resolve(srcPath)
    

    //Make dir for dist if need be
    var destPath = this.files[0].dest
    var destDir = destPath.substr(0, Math.max(destPath.lastIndexOf("/"),destPath.lastIndexOf("\\")));
    if(!grunt.file.isDir(destDir)) {
      grunt.file.mkdir(destDir);
      grunt.log.debug("Created directory \""+destDir+"\"")
    }

    //Build args
    //Source

    var args = [];

    //Set args
    for (var key in options.args){
      var obj = options.args[key];
      args.push("-"+key+":"+obj)
    }

    var srcArg = [];
    srcArg.push("-source:"+options.src.type+"="+srcPath)
    for (var key in options.src.args){
      var obj = options.src.args[key];
      args.push(key+"="+obj)
    }

    var destArg = []
    destArg.push("-dest:"+options.dest.type+"="+destPath);
    for (var key in options.dest.args){
      var obj = options.dest.args[key];
      args.push(key+"="+obj)
    }

    args.push(srcArg.join(","));
    args.push(destArg.join(","));

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

function verifyLocationForType(location,type){
  switch(type){
    case "iisApp":
      if(location.length>1){
        throw new Error('only support one src location for type iisApp');
      }else if(location.length<1){
        throw new Error('must have at least one src location for type iisApp');
      }else if(!grunt.file.isDir(location[0])) {
        throw new Error('Location "' + location[0] + '" for type iisApp must be a directory.');
      }
    break;
    case "package":
    break;
    default:
      throw new Error("Unknown deployment location type \""+type+"\"" );
  }
}

};