appstackr
=========

A personal tool to strategically stack up front-end bundles from js, jsx, css, scss, less, stylus, html-styled template files( swig, ractive, mustache ), or pure html files. Using browserify, browser-sync, uglifyjs, auto-prefixer, htmlcompressor..etc.
    
Add hashes to the stacked bundles. So the browser can long-term cache js, image and css files. Speed up website in production environment.
     

Installation
============================
Install to the project as local dependency ( You should NEVER install building tool in global, or if the building tool is updated, it might break your old projects )
```
$ npm install appstackr --save-dev
```

Edit package.json script property as following( use express as example )
```
"scripts": {
    "start"   : "NODE_ENV=production node ./bin/www",
    "devel"   : "DEBUG={app_name}:* node ./bin/www",
    "appbuild": "appbuild",
    "appstack": "appstack",
    "appwatch": "appwatch --server 0.0.0.0:3000",
    "bsync"   : "npm run devel & npm run appwatch"
     }
```

Add a `stacks.js` file like following
```
module.exports = [
  {
    name: 'base/site',
    nature: 'js',
    files: 'path/to/client/**/*.js'
  },
  {
    name: 'base/site',
    nature: 'css',
    files: [
      'path/to/client/**/*.css',
      'path/to/client/**/*.scss',
      'path/to/client/**/*.less',
      'path/to/client/**/*.styl'
    ]
  }
];
```

Stack up front-end bundles `/js/base/site.min.js` and `/css/base/site.min.css`

```
$ npm run appstack
```


Run command
```
$ npm run bsync
```

Find the view files, edit the `src` and `href` pointed to `/js/base/site.min.js` and `/css/base/site.min.css`


##### Example: 

https://github.com/benpptung/appstackr-examples




Generate an express project with appstackr installed
=================================================

Make sure express-generator is not installed, or remove it temporally

Install the generator:
```
$ npm install -g benpptung/generator
```

create the app:
```
$ express /tmp/foo && cd /tmp/foo
```

Install dependencies:
```
$ npm install
```

Stack up front-end bundles:
```
$ npm run appstack
```

Start server & appwatch together
```
$ npm run bsync
```



##### Stack up bundles while starting appwatch

```
"appwatch": "appwatch -i --server 0.0.0.0:3000"
```

##### Use browser-sync server ( No your own routes & views )

appstackr will direct `browser-sync` to watch `public` folder, which is defined in global config, or `appstackr-settings.json`
```
"appwach": "appwatch -b"

$ npm run appwatch
```



Usage
==========

### stacks.js setup

    module.exports = [
      {
        name: 'site',
        nature: 'js',
        files: 'client/site/**/*.js'
      },
      {
      ...
      }
    ];
    
### stacks.js options

- name: `string` e.g. site or base/site
- files: `glob pattern`, or `path` resolved to a node module of `array`, e.g. `site/**/*.js`, `react`, `react/addons`
- watch: `array` or `string`, to watch the files not included in `files` array. Useful for files `required/imported` in js or css files.
- nature: `js|jhtml|css|chtml|html`
- commonjs: `true`, if nature is `js|jhtml` and browserify options. commonjs is auto set to `true`
- browserfiy: browserify() options. Three additonal options: `exposes`, `externals`, `ignores`.
- autoprefixer: auto-prefixer options to define which browsers want to support.

###### Example to bundle modules into stacks

```
module.exports = [
  {
    name: 'base/site',
    nature: 'js',
    files: [
      'superagent',                                 // bundle the superagent node module
      'client/site/env.js',                         // bundle a local js file
      'node_modules/ractive/ractive-legacy.min.js', // bundle a node module file using relative path
      'react/addons'                                // bundle the react.js addons module
    ],
    browserify: {
      exposes: 'superagent, ractive-legacy.min.js:ractive, react'
        // expose superagent, ractive-legacy.min.js as ractive, react/addons
    }
  },
  {
    name: 'base/helper',
    nature: 'js',
    files: [
      'client/helper/**/*.js'
    ],
    browserify: {
      externals: 'superagent',
        // browserify.external('superagent');
      exposes: 'loader.js:loader' 
        // filename loader.js found in client/helper/**/*.js will be 
        // expose as loader
    }
  },
  {
    name: 'base/iefix',
    nature: 'js',
    files: [
      'node_modules/html5shiv/dist/html5shiv.min.js',
      'node_modules/respond.js/dest/respond.matchmedia.addListener.min.js'
    ]
    // if no commonjs or browserify option, concat the js files directly
  },
]
```
If you see `EMFILE` appstackr error, it means too many files opened. It might happen to require `react` module. One of the workarounds is to stack its minified file directly, e.g. `node_modules/react/dist/react-with-addons.min.js` It is suggested because facebook has tried their best to minify their js files, we shall not minify the files again.


###### browserify tranforms support

To require a `ractive` template and style rules
```
var Ractive = require('ractive');
var component = Ractive.extend({
  el: '#alice-box',
  template: require('./ui.ract'),
  data: {
    name: 'Ben',
    unread: 6,
    total: 10
  },
  css: require('./ui.scss') // or css|less|stylus
});

component();

```

###### react.js support

1. Put `.jsx` file in `files` array of a stack.
2. `require()` the `.jsx` file.


###### auto-prefixer support

```
module.exports = [
  {
    "name": "bootstrap",
    "nature": "css",
    "files": [
      "less/bootstrap/bootstrap.less"
    ],
    "autoprefixer": "> 5%, IE 8"
  },
]
```

### Default directory structure
```
|-- public ( hold the js/css/image files )
|
|-- views ( hold the view files for server routes )      
|
|-- stacks.js ( how to stack up front-end bundles )
|
\-- appstackr-settings.json ( configure appstackr, e.g. define your own public js folder name )
```


### Debug

appstackr has no source map. To figure out what's wrong, use the following command to beautify the codes and see where the error is in browser console. If not sure which source file it is, use `stacks.js` as an index. e.g. to check `example.min.js` 

```
$ npm run appstack -- -bf example:js
```
