// This is a "class" to represent the ${obj_key} object in the game. If you want to render it in the game do so here.
<%include file="functions.noCreer" /><%
parent_classes = obj['parentClasses']
properties = shared['vis']['properties'](obj)
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

% if obj_key != "Game":
/**
 * @typedef {Object} ${obj_key}ID - a "shallow" state of a ${obj_key}, which is just an object with an `id`.
 * @property {string} id - the if of the ${obj_key}State it represents in game.gameObjects
 */
% endif

/**
 * @typedef {Object} ${obj_key}State - A state representing a ${obj_key}
% for property in properties:
 * @property {${property['type']}} ${property['name']} - ${property['description']}
% endfor
 */

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

    /**
     * The current state of this ${obj_key}. Undefined when there is no current state.
     *
     * @type {${obj_key}State|null})}
     */
    current: null,

    /**
     * The next state of this ${obj_key}. Undefined when there is no next state.
     *
     * @type {${obj_key}State|null})}
     */
    next: null,

    // The following values should get overridden when delta states are merged, but we set them here as a reference for you to see what variables this class has.
% if obj_key == "Game":

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     */
    _start: function(state) {
        BaseGame._start.call(this);

${merge("        //", "_start", "        // create some sprites")}
    },

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     */
    _initBackground: function(state) {
        BaseGame._initBackground.call(this);

${merge("        //", "_initBackground", "        // initialize a background bro")}
    },

    /**
     * Called approx 60 times a second to update and render the background. Leave empty if the background is static
     *
     * @private
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    _renderBackground: function(dt, current, next) {
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
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    render: function(dt, current, next) {
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
        var menu = [];

${merge("        //", "_getContextMenu", "        // add context items to the menu here")}

        return menu;
    },


    // Joueur functions - functions invoked for human playable client
% for function_name in obj['function_names']:
<%
    function_parms = obj['functions'][function_name]
    argument_string = ""
    argument_names = []
    arg_names = function_parms['argument_names'] + ["callback"]
    if 'arguments' in function_parms:
        for arg_parms in function_parms['arguments']:
            argument_names.append(arg_parms['name'])
        argument_string = ", ".join(argument_names)
%>
    /**
     * ${function_parms['description']}
     *
% if 'arguments' in function_parms:
% for arg_parms in function_parms['arguments']:
     * @param {${shared['vis']['type'](arg_parms['type'])}} ${("[" + arg_parms['name'] + "]") if arg_parms['optional'] else arg_parms['name']} - ${arg_parms['description']}
% endfor
% endif
% if function_parms['returns']:
     * @param {Function} [callback] - callback that is passed back the return value of ${shared['vis']['type'](function_parms['returns']['type'])} once ran on the server
% endif
     */
    ${function_name}: function(${", ".join(arg_names)}) {
% if 'arguments' in function_parms:
% for i, arg_parms in enumerate(function_parms['arguments']):
% if arg_parms['optional']:
        if(arguments.length <= ${i}) {
            ${arg_parms['name']} = ${shared['vis']['value'](arg_parms['type'], arg_parms['default'])};
        }

% endif
% endfor
% endif
        this._runOnServer("${function_name}", {
% for argument_name in argument_names:
            ${argument_name}: ${argument_name},
% endfor
        }, callback);
    },
% endfor

    // /Joueur functions
% endif

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     */
    _stateUpdated: function(current, next) {
% for parent_class in reversed(parent_classes):
        ${parent_class}._stateUpdated.apply(this, arguments);
% endfor

${merge("        //", "_stateUpdated", "        // update the " + obj_key + " based on its current and next states")}
    },

${merge("    //", "functions", "    // any additional functions you want to add to this class can be perserved here")}

});

module.exports = ${obj_key};
