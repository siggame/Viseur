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
% endif
% if len(parent_classes) == 0 or obj_key == "Player":
<% if obj_key == "Game":
    parent_classes = [ 'BaseGame' ]
elif obj_key == "Player":
    parent_classes.append('BasePlayer')
else:
    parent_classes = [ 'BaseGameObject' ]
%>var ${parent_classes[-1]} = require("viseur/game/${lowercase_first(parent_classes[-1])}");
% endif

${merge("//", "requires", "// any additional requires you want can be required here safely between Creer runs")}

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
     * @param {${obj_key}State} initialState - the initial state of this game object
     * @param {Game} game - the game this ${obj_key} is in
     */
    init: function(initialState, game) {
% for parent_class in parent_classes:
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

% if obj_key == "Game":
    /**
     * How many players are expected to be in an instance of this Game
     *
     * @type {number}
     */
    numberOfPlayers: ${obj['numberOfPlayers']},

    /**
     * Called when Viseur is ready and wants to start rendering the game. This is really where you should init stuff
     *
     * @private
     * @param {GameState} state - the starting state of this game
     */
    _start: function(state) {
        BaseGame._start.call(this);

${merge("        //", "_start", "        // create some sprites")}
    },

    /**
     * initializes the background. It is drawn once automatically after this step.
     *
     * @private
     * @param {GameState} state - initial state to use the render the background
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
     * @param {${obj_key}State} current - the current (most) game state, will be this.next if this.current is null
     * @param {${obj_key}State} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _renderBackground: function(dt, current, next, reason, nextReason) {
        BaseGame._renderBackground.call(this);

${merge("        //", "_renderBackground", "        // update and re-render whatever you initialize in _initBackground")}
    },

    /**
     * Sets the default colors of the player, should be indexed by their place in the Game.players array
     *
     * @param {Array.<Color>} colors - the colors for those players, defaults to red and blue
     */
    _setDefaultPlayersColors: function(colors) {
${merge("        //", "_setDefaultPlayersColors", "        // You can change the players' colors here, by default player 0 is red, player 1 is blue.")}
    },

% else:
<%
if obj_key == "Player":
    #// remove the BasePlayer class as it's been inherited properly now
    parent_classes.pop(1)
%>    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
${merge("    //", "shouldRender", "    shouldRender: false,")}

    /**
     * Called approx 60 times a second to update and render the ${obj_key}. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {${obj_key}State} current - the current (most) game state, will be this.next if this.current is null
     * @param {${obj_key}State} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
% for parent_class in reversed(parent_classes):
        ${parent_class}.render.apply(this, arguments);
% endfor

${merge("        //", "render", "        // render where the " + obj_key + " is")}
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
% for parent_class in reversed(parent_classes):
        ${parent_class}.recolor.apply(this, arguments);
% endfor

${merge("        //", "recolor", "        // replace with code to recolor sprites based on player color")}
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
     * @param {Function} [callback] - callback that is passed back the return value of ${shared['vis']['type'](function_parms['returns']['type']) if function_parms['returns'] else "null"} once ran on the server
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
     * @param {${obj_key}State} current - the current (most) game state, will be this.next if this.current is null
     * @param {${obj_key}State} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
% for parent_class in reversed(parent_classes):
        ${parent_class}._stateUpdated.apply(this, arguments);
% endfor

${merge("        //", "_stateUpdated", "        // update the " + obj_key + " based on its current and next states")}
    },

${merge("    //", "functions", "    // any additional functions you want to add to this class can be perserved here")}

});

module.exports = ${obj_key};
