// This is a "class" to represent the ${obj_key} object in the game. If you want to render it in the game do so here.
<% parent_classes = obj['parentClasses']
%>var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

% if len(parent_classes) > 0:
% for parent_class in parent_classes:
var ${parent_class} = require("./${lowercase_first(parent_class)}");
% endfor
% else:
<% if obj_key == "Game":
    parent_classes = [ 'BaseGame' ]
else:
    parent_classes = [ 'BaseGameObject' ]
%>var ${parent_classes[0]} = require("viseur/game/${lowercase_first(parent_classes[0])}");
% endif

${merge("//", "requires", "// any additional requires you want can be required here safely between Creer runs")}

/**
 * @class
 * @classdesc ${obj['description']}
% for parent_class in reversed(parent_classes):
 * @extends ${parent_class}
% endfor
 */
var ${obj_key} = Classe(${", ".join(parent_classes)}, {
% if obj_key != "Game":
    /**
     * Initializes a ${obj_key} with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof ${obj_key}
     * @private
     */
    init: function(initialState, game) {
% for parent_class in reversed(parent_classes):
        ${parent_class}.init.apply(this, arguments);
% endfor

${merge("        //", "init", "        // initialization logic goes here")}
    },

% endif
    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "${game_name if obj_key == 'Game' else obj_key}",

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.
% if obj_key == "Game":

    /**
     * If this game supports human playable clients
     *
     * @static
     * @type {boolean}
     */
${merge("    //", "humanPlayable", "    humanPlayable: false,")}

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     */
    _start: function() {
        BaseGame._start.call(this);

${merge("        //", "_start", "        // create some sprites")}
    },

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     */
    _initBackground: function() {
        BaseGame._initBackground.call(this);

${merge("        //", "_initBackground", "        // initialize a background bro")}
    },

    /**
     * Called approx 60 times a second to update and render the background. Leave empty if the background is static
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     */
    _renderBackground: function(dt) {
        BaseGame._renderBackground.call(this);

${merge("        //", "_renderBackground", "        // update and re-render whatever you initialize in _initBackground")}
    },
% else:

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
${merge("    //", "shouldRender", "    shouldRender: false,")}

    /**
     * Called approx 60 times a second to update and render the ${obj_key}. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     */
    render: function(dt) {
% for parent_class in reversed(parent_classes):
        ${parent_class}.render.apply(this, arguments);
% endfor

${merge("        //", "render", "        // render where the " + obj_key + " is")}
    },

    /**
     * Invoked when the right click menu needs to be shown.
     *
     * @private
     * @returns {Array} array of context menu items, which can be {text, icon, callback} for items, or "---" for a seperator
     */
    _getContextMenu: function() {
        var self = this;

        return [
${merge("            //", "_getContextMenu", "            // add context menu items here")}
        ];
    },
% endif

    /**
     * Invoked when the state updates.
     *
     * @private
     */
    _stateUpdated: function() {
% for parent_class in reversed(parent_classes):
        ${parent_class}._stateUpdated.apply(this, arguments);
% endfor

${merge("        //", "_stateUpdated", "        // update the " + obj_key + " based on its current and next states")}
    },


${merge("    //", "functions", "    // any additional functions you want to add to this class can be perserved here")}

});

module.exports = ${obj_key};
