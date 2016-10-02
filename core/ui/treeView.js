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

    /**
     * displays some Object as a TreeView
     *
     * @param   {Object} tree - the object to display
     */
    display: function(tree) {
        var id;
        for(id in this._$nodes) {
            if(this._$nodes.hasOwnProperty(id) && id !== "tree-view-node-root") {
                this._$nodes[id].used = false;
            }
        }

        this._displayNode(this.$element, tree, "root", []);

        var uncache = [];
        for(id in this._$nodes) {
            if(this._$nodes.hasOwnProperty(id) && id !== "tree-view-node-root") {
                var $node = this._$nodes[id];
                if(!$node.used) {
                    $node.detach();
                    uncache.push(id);
                }
            }
        }

        for(var i = 0; i < uncache.length; i++) {
            id = uncache[i];
            delete this._$nodes[id];
        }
    },

    /**
     * Displays some node in the suntree
     *
     * @private
     * @param   {$} $parent      - the parent jQuery object
     * @param   {Object} subtree - the subtree to display as a node
     * @param   {string} key     - unique id of the key so far
     * @param   {string} path    - path to the key
     */
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
            var keys = this._getKeys(subtree, path);
            for(var i = 0; i < keys.length; i++) {
                var subkey = keys[i];
                this._displayNode($node.$children, subtree[subkey], subkey, path);
            }
        }
    },

    /**
     * Gets the ID for a path (adds the unqiue treeview string)
     *
     * @private
     * @param   {string} path - the id without the treeview string added
     * @returns {string}      - the id
     */
    _getIdFor: function(path) {
        return "tree-view-node-" + path.join(".");
    },

    /**
     * Gets the jQuery wrapped node given a path to it
     *
     * @private
     * @param   {string} path - path to the node we are trying to locate
     * @returns {$}           - the element wrapped in a $, if found, undefined otherwise
     */
    _get$node: function(path) {
        var id = this._getIdFor(path);
        var $node = this._$nodes[id];

        return $node;
    },

    /**
     * Creates a $ wrapped node for a new subtree
     *
     * @param   {string} id      - the id of the subtree
     * @param   {string} key     - the key to this subtree
     * @param   {*}      value   - what this subtree is
     * @param   {string} path    - path to this subtree
     * @param   {$}      $parent - the parent DOM object of this new node
     * @returns {$}              - the newly created jQuery wrapped DOM element
     */
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

    /**
     * gets the value string representation for some subtree (e.g. {} -> "Object")
     *
     * @param   {Object} subtree - subtree within the tree being displayed
     * @returns {string}         - the string representation of the subtree
     */
    _getValueStringFor: function(subtree) {
        return String(subtree);
    },

    /**
     * Gets, and sorts, the keys for some subtree, ensuring they are always displayed in the same order
     *
     * @param {Object} subtree - the subtree to get keys from
     * @param {Array.<string>} path - path in tree to subtree
     * @returns {Array.<string>} - the keys of the subtree, sorted
     */
    _getKeys: function(subtree, keys) {
        if(Array.isArray(subtree)) {
            return Math.range(subtree.length);
        }

        return Object.keys(subtree).sortAscending();
    },

    /**
     * updates a value for a node already created
     *
     * @param   {$} $node        - the node to update
     * @param   {Object} subtree - the value to update the node's value to
     * @returns {$}              - the node being updated
     */
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

    /**
     * invoked when a child node DOM element is click, so it can be expanded
     *
     * @param   {$} $node            - the node clicked
     * @param   {*} value            - the value of what was clicked
     * @param   {boolean} [collapse] - if it should be force collapsed
     */
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
