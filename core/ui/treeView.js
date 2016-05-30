require("./treeView.scss");

var $ = require("jquery");
var Classe = require("classe");
var BaseElement = require("./baseElement");
var partial = require("../partial");
var utils = require("../utils");

/**
 * @class TreeView - a multi-level tree of expandable lists
 */
var TreeView = Classe(BaseElement, {
    init: function(args) {
        BaseElement.init.apply(this, arguments);

        this._$nodes = {
            "tree-view-node-root": {
                $children: this.$element,
                used: true,
            }
        };

    },

    _template: require("./treeView.hbs"),
    _nodePartial: partial(require("./treeViewNode.hbs")),

    display: function(tree) {
        for(var id in this._$nodes) {
            if(this._$nodes.hasOwnProperty(id) && id !== "tree-view-node-root") {
                this._$nodes[id].used = false;
            }
        }

        this._displayNode(this.$element, tree, "root", []);

        var uncache = [];
        for(var id in this._$nodes) {
            if(this._$nodes.hasOwnProperty(id) && id !== "tree-view-node-root") {
                var $node = this._$nodes[id];
                if(!$node.used) {
                    $node.detach();
                    uncache.push(id);
                }
            }
        }

        for(var i = 0; i < uncache.length; i++) {
            var id = uncache[i];
            delete this._$nodes[id];
        }
    },

    _displayNode: function($parent, subtree, key, path) {
        path = path.concat(key);

        var id = this._getIdFor(path);
        var $node = this._get$node(path);

        if($node) {
            if($node.$value) {
                this._updateValue($node, subtree);
            }
        }
        else {
            $node = this._createNode(id, key, subtree, path, $parent);
        }

        $node.used = true;

        if(utils.isObject(subtree)) { // nested list
            var keys = this._getKeys(subtree);
            for(var i = 0; i < keys.length; i++) {
                var subkey = keys[i];
                this._displayNode($node.$children, subtree[subkey], subkey, path);
            }
        }
    },

    _getIdFor: function(path) {
        return "tree-view-node-" + path.join(".");
    },

    _get$node: function(path) {
        var id = this._getIdFor(path);
        var $node = this._$nodes[id];

        return $node;
    },

    _createNode: function(id, key, value, path, $parent) {
        var $node = this._nodePartial({
            key: key,
            value: this._getValueStringFor(value),
            id: id,
        }, $parent);

        $node.$value = $(".node-value", $node);
        $node.$children = $(".node-children", $node);
        $node.$header = $("header", $node);

        (function(self, $node, value) {
            if(utils.isObject(value)) {
                $node.$header
                    .on("click", function(e) {
                        e.stopPropagation();
                        self._clicked($node, value);
                    })
                    .addClass("expandable");
            }
            else {
                $node.$header
                    .off("click")
                    .removeClass("expandable expanded");
            }
        })(this, $node, value);

        this._$nodes[id] = $node;

        if(path.length > 1) {
            $node.$children.addClass("collapsed");
        }

        this._updateValue($node, value);

        return $node;
    },

    _getValueStringFor: function(subtree) {
        return String(subtree);
    },

    _getKeys: function(subtree) {
        if(Array.isArray(subtree)) {
            return Math.range(subtree.length);
        }

        return Object.keys(subtree).sortAscending();
    },

    _updateValue: function($node, subtree) {
        if(!utils.isObject(subtree)) {
            $node.$header.removeClass("expandable expanded");
        }
        else {
            if(!$node.$header.hasClass("expanded") && !$node.$header.hasClass("expandable")) {
                $node.$header.addClass("expandable");
            }
        }

        return $node.$value.html(this._getValueStringFor(subtree));
    },

    _clicked: function($node, value, collapse) {
        if(collapse === undefined) {
            collapse = !$node.$children.hasClass("collapsed");
        }

        $node.$children.toggleClass("collapsed", collapse);

        if($node.$header) {
            $node.$header
                .toggleClass("expandable", collapse)
                .toggleClass("expanded", !collapse);
        }
    },
});

module.exports = TreeView;
