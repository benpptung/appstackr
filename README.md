Appstackr
=========

>Appstackr aims to provide a simple way to manage website browser clients including Javascript, CSS and Html snippets. 
>It is purely designed for website browser clients management.



Features
========

- A simplified and centralized app stacks file `stacksfile.js` to include all website html snippets, javascript, or css files. The MAIN ideas are:
  - Bundle all the js, css, and html files into few files, so the html won't get overwhelmed by a lot of \<script\> tags.
  - Know where your source files coming from, and reorganize them if needed.
- No limitation how you should structure your browser clients( html/js/css files).
- URL refactor in html and css for CDN deploy. e.g. `todos.min.js` become `todos.min-jadqu9.js` and the url in html is refactored from `'/js/todos.min.js'` to `'//cdn.yoursite.com/js/todos.min-jadqu0.js'`. So, you can simply upload all of your public files to your cdn server.



Installation
============================
Install to your project
```
$ npm install appstackr
```
or install globally
```
$ npm -g install appstackr
```


How to use
==========

1. There are two commands: `appstack` and `appbuild`. Check How to use them via `--help`. Use them on your project root directory, because it will use the `process.cwd()` as the base path.
2. Put a `stacksfile.js` on your project root directory, Check `examples/site/stacksfile.js` for more information. It simply tell appstackr how to split your `js`, `css`, `html` files into different files.
3. Put an optional `appstack-profile.json` on your project root directory. It will configure the `appstack` and `appbuild` command behavior.

### An stacksfile.js example
```
module.exports = [
  /*
   * your site level css, it could be 
   * sass, less or plain css files
   */
  {
    "name": "site",
    "nature": "css",
    "files": [
        "less/mastnav.less"
    ]
  },

  /*
   * todos client stacks
   */
  {
    "name": "todos",
    "nature": "js",
    "files": [
      "client/todos/AppView.js"
    ],
    "commonjs": "browserify"
  },
  {
    "name": "todos",
    "nature": "css",
    "files": [
      "client/todos/less/todos.less"
    ]
  },
  
  {
    "name": "todos",
    "nature": "html",
    "files": [
      "client/todos/todos.html",
      "client/todos/templates.html"
    ]
  },


  /*
   * put plain js files
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
  {
    "name": "bootstrap",
    "nature": "css",
    "files": [
      "less/bootstrap/bootstrap.less"
    ]
  },
  {
    "name": "bootstrap-theme",
    "nature": "css",
    "files": [
      "less/bootstrap/theme.less"
    ]
  }
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
|   \-- snippet
|
|-- dist
|-- stacksfile.js
\-- appstack-profile.json
```
While using command `appstack`, it will load the files described in `stacksfile.js`, concat, minifiy and write to the `public` and `views/snippet` directory.

While using command `appbuild`, it will copy the `js`, `img`, `css`, and `asset` directories under `public` folder, add version control hash, and write to `dist/public` directory, and refactor the urls in `views` and `css` files.

You can define your own views file extension name, currently it is default to `.html` and `.swig`

Demo
========
cd to the example directory `examples\site`

```$ node server.js```

Start up the server to listen on port 3000

```$ appstack```

The above command will create the stacks according to the `appstack.js` file

```$ appbuild```

The above command will create the files under `dist` direcotry.

You can check `lib/profile.js` for more options and configure them on `appstack-profile`.
For example, to configure your CDN URL, simply add the following into the `appstack-profile.json`

```
"cdn": "//{Your cdn url}/"
```
