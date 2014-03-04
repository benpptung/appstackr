Appstacker
=========

> aims to provide a simple way to manage website browser clients including Javascript, CSS and Html snippets. 
>Also, it is not for library. For library , it is suggested to use Grunt.



Features
========
- Support commonjs javascript via browserify or webmake, you can write your javascript in commonjs interface or not.
- Support less or plain CSS
- Simplified and centralized app stacks to include your html snippets, javascript, or css files.
- No limitation how you should structure your browser clients( html/js/css files).
- URL refactor in html and css for CDN deploy



Installation
============================
```
$ npm -g install appstacker
```


How to use
==========

1. There are two commands: `appstack` and `appbuild`. Check How to use them via `--help`. Use them on your project root directory, because it will use the `process.cwd()` as the base path.
2. Put a `appstack.js` on your project root directory, it is similar to Gruntfile.js, but much simplified for only the stacks you want to put on your website. Check `examples/site/appstack.js` for more information.
3. Put an optional `appstack-profile.json` on your project root directory. It is to configure the `appstack`.



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
|-- appstack.js
\-- appstack-profile.json
```
While using command `appstack`, it will load the files described in `appstack.js`, concat, minifiy and write to the `public` and `views-snippet` directory.

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
