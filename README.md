# grunt-msdeploy

> The best msdeploy Grunt plugin ever.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-msdeploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-msdeploy');
```

## The "msdeploy" task

### Overview
In your project's Gruntfile, add a section named `msdeploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  msdeploy: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

This plugin directly translates options to a command string, the first level creates '-option:' syntax and the second creates 'arg1=1,arg2=2'

The available options can be found here http://technet.microsoft.com/en-us/library/dd569106(v=ws.10).aspx

### Usage Examples

In this example we perform a sync between an iisApp and a package (.zip)

```js
msdeploy:{
  pack:{
    options:{
      verb:"sync",
      source:{
        iisApp:path.resolve("<%= options.dist_dir %>/MyProject")
      },
      dest:{
        package:"<%= options.dist_dir %>/MyProject.zip"
      }
    }
  },
}
```

In this example we deploy the previously created package to 'myServer'

```
msdeploy:{
  push:{
    options:{
      verb:"sync",
      allowUntrusted:"true",
      source:{
        package:"<%= msdeploy.pack.options.dest.package %>"
      },
      dest:{
        iisApp:"MyProjectDir/",
        wmsvc:"myServer"
      }
    }
  }
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
- 0.2.0-beta Enforce more control on tasks
- 0.1.2 Use local msdeploy with more obvious exception
- 0.1.1 Package msdeploy.exe to prevent dependency issues
- 0.1.0 Initial release
