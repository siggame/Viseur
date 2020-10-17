<%include file="functions.noCreer" />// This is where you build your the Human player interactions with Viseur for the ${game_name} game.
<%
imports = {
    'src/viseur/game': ['BaseHumanPlayer'],
    './game': ['Game'],
}

imports['./state-interfaces'] = []
if ai['functions']:
    for function_name, function_parms in ai['functions'].items():
        for arg in function_parms['arguments']:
            arg_type = shared['vis']['type'](arg['type'])
            if arg['type'] and arg['type']['is_game_object']:
                if arg_type not in imports['./state-interfaces']:
                    imports['./state-interfaces'].append(arg_type)

if len(imports['./state-interfaces']) == 0:
    imports.pop('./state-interfaces', None)


%>${shared['vis']['imports'](imports)}
${merge("// ", "imports", "// any additional imports you want can be added here safely between Creer runs", help=False)}

/**
 * This is the class to play the ${game_name} game as a human.
 * This is similar to building an "AI", but you need to query the human player
 * for things and then use callback actions to send values to the game server.
 */
export class HumanPlayer extends BaseHumanPlayer {
    /** The game this human player is playing. */
    public game!: Game;

    /**
     * Set this static flag to true to mark this game as able to be played by
     * human players. Leave as false to ignore that functionality.
     */
    public static get implemented(): boolean {
${merge("        //  ", "implemented", "        return false; // set this to true if humans can play this game", help=False)}
    }

${merge("    //  ", "variables", "    // any additional variables you want to add for the HumanPlayer", help=False)}

    /**
     * Creates the human player for this game. This class will never be
     * used if the static implemented flag above is not set to true.
     *
     * @param game - The game this human player is playing.
     */
    constructor(game: Game) {
        super(game);

${merge("        //  ", "constructor", "        // construct this human player", help=False)}
    }

    // -- Orders: things the game server tells this human player to do -- \\\


% for function_name in ai['function_names']:
<%
function_parms = dict(ai['functions'][function_name])
returnless = dict(function_parms)

arguments = list(function_parms['arguments'])
return_type = 'void'
return_description = ''
if function_parms['returns']:
    return_description = function_parms['returns']['description']
    return_type = shared['vis']['type'](function_parms['returns']['type'])
    returnless.pop('returns', None)

arguments.append({
    'name': 'callback',
    'type': {
        'name': '(returned: ' + return_type + ') => void',
        'is_game_object': False,
    },
    'description': 'The callback that eventually returns the return value from the server.' + ((' - The first argument to the callback is the return value: ' + return_description) if return_description else '')

})
returnless['arguments'] = arguments
%>${shared['vis']['function_top'](function_name, returnless)}
${merge("        // ", function_name, "        // Put your game logic here for " + function_name, help=False)}
    }

% endfor
${merge("    // ", "functions", "    // any additional functions you want to add for the HumanPlayer", help=False)}
}
