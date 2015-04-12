appstackr
=========

appstackr is a simplified build tool for html template, js, css, images. It aims to pre-build the files into static assets and ready to publish to cdn storage.



Features
========

- Support browserify, browser-sync and auto-prefixer.

- A simplified and centralized app stacks file `stacks.js` to include all website html snippets, javascript, or css files. The MAIN ideas are:

  >Group your `client-side component files` by folder or module. That said, a TodoApp might include some js, css(or less, sass), and html(or template files, such as swig, handlebars) files. Put all of them under the same folder or in an external module, and "stacking" them as you wish in the `stacks.js` file. And in your public facing site or app,  it can be very simplified to include only `site.min.css`, `bundle.min.js` and `app-for-current-page.min.js`.
   
- Put all of your settings on the `appstackr-settings.json` to modify the default settings in `lib/config.js`

- No limitation how you should structure your browser clients( html/js/css files).

- URL refactor in html and css for CDN deploy. e.g. `todos.min.js` become `todos.min-jadqu9.js` and the url in html is refactored from `'/js/todos.min.js'` to `'//cdn.yoursite.com/js/todos.min-jadqu0.js'`. So, you can simply upload all of your public files to your cdn server.



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

Then, you can run appwatch command as following:
( need npm 2.x.x above to add arg )
```s
$ npm run bsync
```

It will start browser-sync and watch all the files in stacks.js, including stacks.js itself.
see example https://github.com/benpptung/generator
