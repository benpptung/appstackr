'use strict';

var React = require('react/addons');
var TodoList = React.createClass({
  render: function() {
    var createItem = function(item_text, index) {
      return <li key={index + item_text}>{item_text}</li>
    };
    return <ul>{this.props.items.map(createItem)}</ul>
  }
});

var TodoApp = React.createClass({
  getInitialState: function() {
    return { items: [], text: ''};
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var nextItems = this.state.items.concat([this.state.text]);
    var nextText = '';
    this.setState({items: nextItems, text: nextText});
  },

  render: function() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={this.state.items} />
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.text} />
          <button>{'Add #' + (this.state.items.length + 1)}</button>
        </form>
      </div>
    )
  }
});

module.exports = function(mount_node) {
  React.render(<TodoApp />, mount_node);
};