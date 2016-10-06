require("./inspectTreeView.scss");

var $ = require("jquery");
var Classe = require("classe");
var TreeView = require("core/ui/treeView");
var utils = require("core/utils");
var Viseur = require("viseur/");

/**
 * @class InspectTreeView - a tree view for the Inspect tab that support game object cycles
 */
var InspectTreeView = Classe(TreeView, {
    init: function(args) {
        TreeView.init.apply(this, arguments);

        this.$element.addClass("inspect-tree-view");
    },

    setGameObjects: function(gameObjects) {
        this._gameObjects = gameObjects;
    },

    _getGameObject: function(id) {
        if(this._gameObjects) {
            return this._gameObjects[id];
        }
    },

    display: function(tree, gameObjects, outsideTreeView) {
        if(gameObjects) {
            this.setGameObjects(gameObjects);
        }

        this._outsideTreeView = outsideTreeView;

        return TreeView.display.apply(this, arguments);
    },

    _getValueStringFor: function(subtree) {
        if(utils.isObject(subtree)) {
            if(Array.isArray(subtree)) {
                return "List[{}]".format(subtree.length);
            }
            else if(subtree.id) {
                var gameObject = this._getGameObject(subtree.id);
                var gameObjectName = gameObject ? gameObject.gameObjectName : "Game Object";
                return gameObjectName + " #" + subtree.id;
            }
            else { // normal object, so treat it like a dictionary
                return "Dictionary[{}]".format(Object.keys(subtree).length);
            }
        }

        return TreeView._getValueStringFor.call(this, subtree);
    },

    _getTypeFor: function(subtree) {
        if(utils.isObject(subtree)) {
            if(Array.isArray(subtree)) {
                return "list";
            }
            else if(subtree.id) {
                return subtree.gameObjectName ? "game-object": "game-object-reference";
            }
            else { // normal object, so treat it like a dictionary
                return "dictionary";
            }
        }

        return typeof(subtree);
    },

    _getKeys: function(subtree, path) {
        if(subtree === this._gameObjects) {
            return Math.range(Math.max.apply(Math, Object.keys(subtree)));
        }

        if(subtree.id) { // figure out if it is the real path to the game object, or just a reference to it
            if(path.length === 3 && path[0] === "root" && path[1] === "gameObjects") { // then the path is somethling like "root" -> "gameObjects" -> "0", which is the actual game object
                // it's good, use the return at the bottom (Code reads better this way IMO)
            }
            else { // it's just a reference
                return [ "id" ];
            }
        }

        return TreeView._getKeys.apply(this, arguments);
    },

    _updateValue: function($node, subtree) {
        var $value = TreeView._updateValue.apply(this, arguments);

        var typeClass = "type-" + this._getTypeFor(subtree);
        if(!$value.hasClass(typeClass)) {
            $value.removeClass(function(index, css) {
                return (css.match(/(^|\s)type-\S+/g) || []).join(" ");
            }).addClass(typeClass);
        }

        return $value;
    },

    _clicked: function($node, value) {
        if(value.id) { // it's a game object...
            if(Viseur.game) {
                Viseur.game.highlight(value.id);
            }

            if(!value.gameObjectName) { // ... reference, so scroll to that reference
                this.highlightGameObject(value.id);
                return;
            }
        }

        return TreeView._clicked.apply(this, arguments);
    },

    _get$node: function(path, searchOutside) {
        var $node = TreeView._get$node.apply(this, arguments);

        if($node || !searchOutside) {
            return $node;
        }

        // search outside
        return this._outsideTreeView._get$node(path);
    },

    highlightGameObject: function(id) {
        TreeView._clicked.call(this, this._get$node(["root", "gameObjects"], true), null, false);

        var $referedNode = this._get$node(["root", "gameObjects", id], true);

        TreeView._clicked.call(this, $referedNode, null, false);

        if(this._highlightingNode) {
            this._highlightingNode.removeClass("highlighted");
            clearTimeout(this._highlightTimeout);
        }

        this._highlightingNode = $referedNode
            .addClass("highlighted");

        var self = this;
        this._highlightTimeout = setTimeout(function() {
            self._highlightingNode.removeClass("highlighted");
            self._highlightingNode = null;
            self._highlightTimeout = null;
        }, 2000);

        $referedNode[0].scrollIntoView();
    },
});

module.exports = InspectTreeView;
