appstackr
=========

A personal tool to help me maintaining my projects. Hope it helpful to you too. It bundles:

    1. js|jsx files via browserify or not.
    2. css|scss|less|stylus with auto-prefixer or not
    
It supports URL refactor in html/css for CDN production deployment.

    For example, todos.min.js will be renamed as todos.min-jadqu0.js with its version hash added and the url in views files are refactored too.
     

Installation
============================
Install to the project as local dependency
```
$ npm install appstackr --save-dev
```

Edit package.json script property as following if express project
```
"scripts": {
    "start"   : "node ./bin/www",
    "appstack": "appstack",
    "appbuild": "appbuild",
    "appwatch": "appwatch -i --server 0.0.0.0:3000",
    "devel"   : "DEBUG={app_name}:* node ./bin/www",
    "bsync"   : "npm run devel & npm run appwatch"
     }
```

Run command - Enjoy Multiple Screens Live Reload & app building at the same time.
```
$ npm run bsync
```

It will start the server in DEBUG mode listening on port 3000. Then, start files watch on the files described in `stacks.js`, including `stacks.js` itself. Then, start `browser-sync` and proxy to `0.0.0.0:3000`

##### Example: https://github.com/benpptung/generator

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

Rock and Roll
```
$ npm run bsync
```



###### No initial stacking

```
"appwatch": "appwatch --server 0.0.0.0:3000"
```

###### No server

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
        files: 'client/site/style.scss'
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
If see `EMFILE` appstackr error, it means there are too many files opened. It might happen to require `react` module. One of the workarounds is to stack its minified file directly, e.g. `node_modules/react/dist/react-with-addons.min.js` Also, facebook has tried their best to minify their js files, we shall not minify the files again.


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
|-- public
|
|-- views
|   |
|   \-- components
|
|-- dist
|-- stacks.js
\-- appstackr-settings.json
```
