/*
 * grunt-msdeploy
 * https://github.com/mrjackdavis/grunt-msdeploy
 *
 * Copyright (c) 2014 mrjackdavis
 * Licensed under the MIT license.
 */

 'use strict';

 var path = require('path');
 module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('msdeploy', 'The best msdeploy Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.

    var options = this.options({
      msdeployPath:"\""+path.resolve("/Program Files (x86)/IIS/Microsoft Web Deploy V3/msdeploy.exe")+"\""
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
        var i = 0;
        for (var prop in obj) {
          if(obj.hasOwnProperty(prop)){
            var str = prop + "=\"" + obj[prop]+"\"";
            command += (str);
          }
        }
        //Remove last comma
        str.substring(0, str.length - 1);
      }
    }

    command = path.resolve("/Program Files (x86)/IIS/Microsoft Web Deploy V3/msdeploy.exe");
    grunt.log.writeln(command);
    var done = this.async();
    grunt.util.spawn({
      cmd:command
    },function(error,result,code){
      grunt.log.writeln(error);
      grunt.log.writeln(result);
      grunt.log.writeln(code);
      done();
    });
  });

};
