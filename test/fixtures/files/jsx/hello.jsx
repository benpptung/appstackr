'use strict';

var React = require('react/addons');

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>
  }
});

module.exports = function(mount_node) {
  React.render(<HelloMessage name="Ben P.P. Tung" />, mount_node);
};

