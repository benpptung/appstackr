Appstackr
=========

>Appstackr aims to provide a simple way to manage website browser clients including Javascript, CSS and Html snippets. 
>It is purely designed for website browser clients management.



Features
========
- Support commonjs javascript via browserify or webmake, you can write your javascript in commonjs interface or not.
- Support less or plain CSS
- A simplified and centralized app stacks file `stacksfile.js` to include all website html snippets, javascript, or css files.
- No limitation how you should structure your browser clients( html/js/css files).
- URL refactor in html and css for CDN deploy. e.g. `todos.min.js` become `todos.min-jadqu9.js` and the url in html is refactored from `'/js/todos.min.js'` to `'//cdn.yoursite.com/js/todos.min-jadqu0.js'`. So, you can simply upload all of your public files to your cdn server.



Installation
============================
```
$ npm -g install appstackr
```


How to use
==========

1. There are two commands: `appstack` and `appbuild`. Check How to use them via `--help`. Use them on your project root directory, because it will use the `process.cwd()` as the base path.
2. Put a `stacksfile.js` on your project root directory, it is similar to Gruntfile.js, but much simplified for only the stacks you want to put on your website. Check `examples/site/stacksfile.js` for more information.
3. Put an optional `appstack-profile.json` on your project root directory. It will configure the `appstack` and `appbuild` command behavior.



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
