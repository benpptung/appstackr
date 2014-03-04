module.exports = [
  /*
   * todos stacks
   */
  {
    "name": "todos",
    "nature": "js",
    "files": [
      "client/todo/VAppView.js"
    ],
    "commonjs": "webmake"
  },
  {
    "name": "todos",
    "nature": "css",
    "files": [
      "less/app-todo/todos.css"
    ]
  },
  /*
   *  alert stack
   */
  {
    "name": "alert",
    "nature": "jhtml",
    "files": [
      "client/alert/transition.js",
      "client/alert/alert.js"
    ]
  },
/**
 *  bootstrap stacks
 */
  {
    "name": "bs",
    "nature": "js",
    "files": [
      "client/bs/**/*.js"
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
      "less/theme/theme.less"
    ]
  }
]