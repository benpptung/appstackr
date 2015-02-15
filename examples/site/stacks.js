module.exports = [
  /*
   *
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
    // concat successful, but it seems no htmlcompress ?
  {
    "name": "todos",
    "nature": "html",
    "files": [
      "client/todos/todos.html",
      "client/todos/templates.html"
    ]
  },


  /*
   * bootstrap library stacks
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
  },

  /*
   *  vacation-notice stacks
   */

  {
    "name": "note",
    "nature": "html",
    "files": [
      "client/note/main.html",
      "client/note/cdn.html"
    ],
    "concat": false
  },
  {
    "name": "note",
    "nature": "chtml",
    "files": [
      "client/note/main.css"
    ]
  },
  {
    "name": "note",
    "nature": "jhtml",
    "files": [
      "client/note/note.js"
    ]
  }
]