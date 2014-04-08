/*
 * grunt-msdeploy
 * https://github.com/mrjackdavis/grunt-msdeploy
 *
 * Copyright (c) 2014 mrjackdavis
 * Licensed under the MIT license.
 */

 'use strict';

 var exec = require('child_process').exec;
 var path = require('path');
 var fs = require('fs');

 module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('msdeploy', 'The best msdeploy Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.

    var options = this.options({
      msdeployPath: getExePath()
      //msdeployPath: "\""+path.resolve("/Program Files (x86)/IIS/Microsoft Web Deploy V3/msdeploy.exe")+"\""
    });
    grunt.log.writeln();
    grunt.log.writeln();
    grunt.log.writeln(this.target);
    grunt.log.writeln();

    var command = "";

    //Build command
    //Loop through,
    //Assume all level 1 are arguments: "-arg:"
    //Assume all level 2 is parameters, can be a string, or multiple key value pairs

    command += options.msdeployPath;
    delete options["msdeployPath"];

    for (var key in options){
      //append level 1 to command
      command += " -"+key+":";

      var obj = options[key];

      //Check if level 2 is string
      if(typeof obj === 'string' || obj instanceof String){
        //append string to command
        command += obj;
      }else{
        //level 2 is key value pair, loop through and attach

        for (var prop in obj) {
          if(obj.hasOwnProperty(prop)){
            var str = prop + "=" + escapeShell(obj[prop])+",";
            command += (str);
          }
        }
        //Remove last comma
        command = command.slice(0, -1);
      }
    }

    grunt.log.debug(command);
    grunt.log.writeln("Working...");

    var done = this.async();
    var child = exec(command, {maxBuffer:1000*1024},function (error, stdout, stderr) {
      grunt.log.writeln(stdout);

      if(!stderr && stderr !== ""){
        grunt.fail.warn("stderr:\""+stderr+"\"",3);
      }
      if (error !== null) {
        grunt.fail.warn(error,3);
      }

      done();
    });
  });

  function getExePath() {

    var relativeMsDeployPath = "IIS/Microsoft Web Deploy V3/msdeploy.exe";
    var msDeploy64Path = path.resolve(path.join(process.env.ProgramFiles,relativeMsDeployPath));
    var msDeploy32Path = path.resolve(path.join(process.env["ProgramFiles(x86)"],relativeMsDeployPath));

    if (fs.existsSync(msDeploy64Path)) {
      return escapeShell(msDeploy64Path);
    }

    if (fs.existsSync(msDeploy32Path)) {
      return escapeShell(msDeploy64Path);
    }

    throw new Error("MSDeploy doesn't seem to be installed. Could not find msdeploy in \""+msDeploy64Path+"\" or \""+msDeploy32Path+"\". You can install it from http://www.iis.net/downloads/microsoft/web-deploy")
  }

  function escapeShell(cmd) {
    return '"'+cmd+'"';
  };
};