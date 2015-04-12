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
```
$ npm run bsync
```

It will start browser-sync and watch all the files in stacks.js, including stacks.js itself.

How to use
==========

1. There are two commands: `appstack` and `appbuild`. Check How to use them via `--help`. Use them on your project root directory, because it will use the `process.cwd()` as the base path.
2. Put a `stacks.js` on your project root directory, Check `examples/site/stacks.js` for more information. It simply tell appstackr how to split your `js`, `css`, `html` files into different files.
3. Put an optional `appstackr-settings.json` on your project root directory. It will configure the `appstack` and `appbuild` command behavior.

### A stacks.js file example
```
module.exports = [
  /*
   * you can simply mix less, scss and css together...
   * nature: css ==> css file
   * nature: chtml ==> for css components to embed in html
   */
  {
    "name": "site",
    "nature": "css",
    "files": [
        "less/mastnav.less",
        "scss/whatever.scss",
        "purecss/whatever.css"
    ]
  },

  /*
   * support browserify to bundle your js files into one
   */
  {
    "name": "todos",
    "nature": "js",
    "files": [
      "client/todos/AppView.js"
    ],
    "commonjs": "browserify"
  },

  /*
   * Move the html under your client folder to the views folder
   * if concat property added, it will concat the html files into one.
   */
  {
    "name": "todos",
    "nature": "html",
    "files": [
      "client/todos/todos.html",
      "client/todos/templates.html"
    ]
  },


  /*
   * if no commonjs property, it simply concat the js files into one
   */

  {
    "name": "bootstrap",
    "nature": "js",
    "files": [
      "client/bootstrap/transition.js",
      "client/bootstrap/alert.js",
      "client/bootstrap/button.js",
      "client/bootstrap/carousel.js",
      "client/bootstrap/collapse.js",
      "client/bootstrap/dropdown.js",
      "client/bootstrap/modal.js",
      "client/bootstrap/tooltip",
      "client/bootstrap/popover",
      "client/bootstrap/scrollspy.js",
      "client/bootstrap/tab.js",
      "client/bootstrap/affix.js"
    ]
  },
  
  /*
   * if autoprefixer property exist in css or chtml nature stack,
   * it will apply autoprefixer based on the browserslist config
   * Or you can simply use "autoprefixer": true to use the default
   * autoprefixer config in 'profile' or 'appstackr-settings.json' 
   */
   
  {
    "name": "bootstrap",
    "nature": "css",
    "files": [
      "less/bootstrap/bootstrap.less",
      "scss/whatever/_bs3.scss"
    ],
    "autoprefixer": "> 5%, IE 8"
  },
]
```

### Default directory structure ###
```
|-- public
|   |-- js
|   |-- img
|   |-- css
|   \-- asset
| 
|-- views
|   |
|   \-- components
|
|-- dist
|-- stacks.js
\-- appstackr-settings.json
```
While using command `appstack`, it will load the files described in `stacks.js`, concat, minifiy and write to the `public` and `views/components` directory.

While using command `appbuild`, it will copy the `js`, `img`, `css`, and `asset` directories under `public` folder, add version control hash, and write to `dist/public` directory, and refactor the urls in `views` and `css` files.

You can define your own views file extension name, currently it is default to `.html`, `.swig`.

Demo
========

```$ cd examples/site```



create the stacks according to the `stacks.js` file in the site root directory

```$ ../../bin/appstack```


start the development server listening on port 3000

```$ node server.js```


refactor the static assests with version control hash
like the following


```$ ../../bin/appbuild```


The above command will create the files under `dist` direcotry. e.g. check the `examples/site/dist/views/todo-mvc.html` view file, 
the `todo.min.css` is changed to`todos.min-uvrtjr.css` now.


Now, start the dummy production server listening on port 3000

```$ NODE_ENV=production node server.js ```

the server is now using `//localhost:3000/css/todos.min-uvrtjr.css` instead of `css/todos.min.css` in the `http://localhost:3000/TodoMVC/` page.




More Options
=============

You can check `lib/config.js` for more options and configure them on `appstackr-settings.json`.
For example, to configure your CDN URL, simply add the following into the `appstackr-settings.json`

```
"cdn": "//{Your cdn url}/"
```
