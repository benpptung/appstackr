{% extends './basetpl/layout-base.swig' %}

{% block header %}
    <style>
        .inner {
            column-count: 1;
            column-gap: 1em;
            column-fill: auto;
        }
    </style>
{% endblock %}

{% block layout %}
                    <div class="example-list">

                        <div class="inner">

                            <div class="case">
                                <code>
                                    <a href="/tutorials/alice-box-precompile">Example #1</a>
                                </code>
                                <div class="caption">
                                    <h3>Template in JS file</h3>
                                    <p>Require Ractive.js template in js via browserify</p>
                                    <p>Require general template file as string type in js via browserify</p>
                                </div>
                            </div>
                            <div class="case">
                                <img src="holder.js/150x150/#393939:#ffffff">
                                <div class="caption">
                                    <h3>Browserify bundle</h3>
                                    <p>Expose local module</p>
                                    <p>Expose node module</p>
                                    <p>External exposed module</p>
                                    <p>Transform support.</p>
                                </div>
                            </div>
                            <div class="case">
                                <img src="holder.js/150x150/#393939:#ffffff">
                                <div class="caption">
                                    <h3>Browserify bundle</h3>
                                    <p>Expose local module</p>
                                    <p>Expose node module</p>
                                    <p>External exposed module</p>
                                </div>
                            </div>
                            <div class="case">
                                <img src="holder.js/150x150/#393939:#ffffff">
                                <div class="caption">
                                    <h3>Browserify Transform Support</h3>
                                    <p>css: .scss, .less, .styl, and .css files</p>
                                    <p>js: .js, .jsx files</p>
                                    <p>template: .ract</p>
                                    <p>convert text file as string in js</p>
                                </div>
                            </div>
                            <div class="case">
                                <img src="holder.js/150x150/#393939:#ffffff">
                                <div class="caption">
                                    <h3>Auto-prefixer</h3>
                                    <p>
                                        Support auto-prefixer to pre-compile css. No matter it is to require css file in
                                        browserify bundle or concat css files (.less, .scss, .styl, .css).
                                    </p>
                                </div>
                            </div>
                            <div class="case">
                                <code>
                                    <a href="/tutorials/alice-box-html">Example</a>
                                </code>
                                <div class="caption">
                                    <h3>Template in View</h3>
                                    <p>Copy template files to view folder, and embed it in a view</p>
                                </div>
                            </div>
                            <div class="case">
                                <code>
                                    var template = require('./todo.html');
                                    ...
                                    mountnode.innerHtml = template;
                                </code>
                                <div class="caption">
                                    <h3>TodoList</h3>
                                </div>
                            </div>
                            <div class="case">
                                <code>
                                    var Ractive = require('ractive');
                                    ...
                                    require('./todo.ract');
                                    ...
                                </code>
                                <div class="caption">
                                    <h3>TodoList by Ractive.js</h3>
                                </div>
                            </div>
                            <div class="case">
                                <code>
                                    var React = require('react');
                                    ...
                                    React.createClass({
                                        render: ...
                                    });
                                </code>
                                <div class="caption">
                                    <h3>TodoList by React.js</h3>
                                    <p><a href="/tutorials/todos-react">Example</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
{% endblock %}

{% block footer %}
    <script>
        !function(win){
            'use strict';
            win.foo = function(){};
        }(window);
    </script>
{% endblock %}