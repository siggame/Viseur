// This is where you build your the Human player interactions with Viseur for the ${game_name} game.
<%include file="functions.noCreer" />
var Class = require("classe");
var BaseHumanPlayer = require("viseur/game/baseHumanPlayer");

${merge("// ", "requires", "// any additional requires you want can be required here safely between creer runs")}

/**
 * @class
 * @classdesc This is the class to play the ${game_name} game as a human. This is similar to building an "AI", but you need to query the human player for things and then callback actions.
 */
var HumanPlayer = Class(BaseHumanPlayer, {
    init: function() {
        BaseHumanPlayer.init.apply(this, arguments);

${merge("        // ", "init", "        // initialize variables here")}
    },

    /**
     * Set this to true if you have coded the logic to make this human playable. otherwise leave it as false if you don't plan to fill this out.
     *
     * @static
     */
${merge("    // ", "implimented", "    implimented: false,")}



     //--- Orders: things the game server tells this player to do --- \\
% for function_name in ai['function_names']:
<%
    function_parms = ai['functions'][function_name]
    argument_string = ""
    argument_names = []
    args = (function_parms['arguments'] if 'arguments' in function_parms else []) + [{
        "type": {
            "is_game_object": False,
            "keyType": None,
            "name": "function",
            "valueType": None
        },
        "name": "callback",
        "description": "The callback function, which acts as a return. When you are done with the order your MUST invoke this, and pass the 'return' value back."
    }]
    for arg_parms in args:
        argument_names.append(arg_parms['name'])
    argument_string = ", ".join(argument_names)
%>
    /**
     * ${function_parms['description']}
     *
% for arg_parms in args:
     * @param {${shared['vis']['type'](arg_parms['type'])}} ${arg_parms['name']} - ${arg_parms['description']}
% endfor
% if function_parms['returns']:
     *    The callback should pass as the first arg: {${shared['vis']['type'](function_parms['returns']['type'])}} - ${function_parms['returns']['description']}
% endif
     */
    ${function_name}: function(${argument_string}) {
${merge("        // ", function_name, "        // Put your game logic here for " + function_name)}
    },
% endfor



${merge("    //", "functions", "    // any additional functions you want to add for the HumanPlayer")}

});

module.exports = HumanPlayer;
