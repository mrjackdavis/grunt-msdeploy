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
var iis = require('vsts-iis');
const util = require('util');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('msdeploy', 'The best msdeploy Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    //grunt.log.write(util.inspect(this, {showHidden: false, depth: null}));
    var options = this.options({
      msdeployPath: getExePath()
      //msdeployPath: "\""+path.resolve("/Program Files (x86)/IIS/Microsoft Web Deploy V3/msdeploy.exe")+"\""
    });
    grunt.log.writeln();
    grunt.log.writeln();
    grunt.log.writeln(this.target);
    grunt.log.writeln();

    var args = [];
    var command = options.msdeployPath;

    //Build args
    //Loop through,
    //Assume all level 1 are arguments: "-arg:"
    //Assume all level 2 is parameters, can be a string, or multiple key value pairs

    delete options["msdeployPath"];

    for (var key in options){
      //append level 1 to args
      var argument = "-"+key+":";

      //Check if key is a skip, skip2, skipN and create a skip argument
      if (key.substr(0,4) === 'skip')
        argument = "-skip:";

      var obj = options[key];

      //Check if level 2 is string
      if(typeof obj === 'string' || obj instanceof String){
        //append string to args
        argument += obj;
      }else{
        //level 2 is key value pair, loop through and attach

        for (var prop in obj) {
          if(obj.hasOwnProperty(prop)){
            var str = prop + "=" + obj[prop]+",";
            argument += (str);
          }
        }
        //Remove last comma
        argument = argument.slice(0, -1);
      }

      //Add argument to args
      args.push(argument);
    }

    grunt.log.debug(args);
    grunt.log.writeln("Working...");

    var done = this.async();
    var iisConfig = this.data.iis;

    if (iisConfig) {

      var iisServer = new iis.PsExec(iisConfig.server);

      iisServer.Sites.exists(iisConfig.site.domain).then(function(exists){
        if (!exists) {
            grunt.log.writeln("Site not exist. Creating Site.");
            grunt.log.writeln("Creating AppPool.");

            iisServer.AppPools.add(iisConfig.site.domain).then(function(){
              grunt.log.writeln("AppPool Created");
              iisServer.Sites.add({
                name: iisConfig.site.domain,
                protocol: 'http',
                port: 80,
                host: iisConfig.site.domain,
                path : iisConfig.site.path
              }).then(function(result) {
                grunt.log.writeln("Site added!");
                iisServer.Sites.setAppPool(iisConfig.site.domain, iisConfig.site.domain).then(function(){
                  grunt.log.writeln("Seted AppPool to Site");
                  deploy(command, args, done);
                });
              });
            })

          } else {
            grunt.log.writeln("Site alredy exist. Deploying.");
            deploy(command, args, done);
          }
      });
    } else {
      deploy(command, args, done);
    }
  });


  function deploy(command, args, done) {
    var process = spawn(command,args);

    process.stdout.on('data', function(data) { grunt.log.write(data) });
    process.stderr.on('data', function(data) { grunt.log.error(data); });
    process.on('exit', function(code) {
        if (code !== 0) {
            grunt.fail.warn('Something went wrong');
        }
        done();
    });
  };

  function getExePath() {

    var relativeMsDeployPath = "IIS/Microsoft Web Deploy V3/msdeploy.exe";

    var path64 = process.env.ProgramFiles,relativeMsDeployPath;
    var path32 = process.env["ProgramFiles(x86)"],relativeMsDeployPath;

    if (path64 != null) {
      var msDeploy64Path = path.resolve(path.join(process.env.ProgramFiles,relativeMsDeployPath));
      if (fs.existsSync(msDeploy64Path)) {
        grunt.log.writeln("Found 64-bit version of msdeploy");
        return msDeploy64Path;
      }
    }

    if (path32 != null) {
      var msDeploy32Path = path.resolve(path.join(process.env["ProgramFiles(x86)"],relativeMsDeployPath));
      if (fs.existsSync(msDeploy32Path)) {
        grunt.log.writeln("Found 32-bit version of msdeploy");
        return msDeploy64Path;
      }
    }

    throw new Error("MSDeploy doesn't seem to be installed. Could not find msdeploy in \""+msDeploy64Path+"\" or \""+msDeploy32Path+"\". You can install it from http://www.iis.net/downloads/microsoft/web-deploy")
  }

  function escapeShell(cmd) {
    return '"'+cmd+'"';
  };
};
