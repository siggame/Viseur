<%include file="functions.noCreer" />// This is where you build your the Human player interactions with Viseur for the Anarchy game.
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
            if arg_type[0] == 'I': #// then it's an interface
                if arg_type not in imports['./state-interfaces']:
                    imports['./state-interfaces'].append(arg_type)

if len(imports['./state-interfaces']) == 0:
    imports.pop('./state-interfaces', None)


%>${shared['vis']['imports'](imports)}
${merge("// ", "imports", "// any additional imports you want can be added here safely between Creer runs", help=False)}

/**
 * This is the class to play the Anarchy game as a human.
 * This is similar to building an "AI", but you need to query the human player
 * for things and then use callback actions to send values to the game server.
 */
export class HumanPlayer extends BaseHumanPlayer {
    /**
     * Set this static flag to true to mark this game as able to be played by
     * human players. Leave as false to ignore that functionality
     */
    public get implemented(): boolean {
${merge("    //  ", "implemented", "        return false; // set this to true if humans can play this game", help=False)}
    }

${merge("    //  ", "variables", "    // any additional variables you want to add for the HumanPlayer", help=False)}

    /**
     * Creates the human player for this game. This class will never be
     * used if the static implemented flag above is not set to true
     * @param game the game this human player is playing
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
    'description': 'The callback that eventually returns the return value from the server.' + (' - The returned value is ' + return_description) if return_description else ''

})
docstring = shared['vis']['block_comment']('    ', returnless)

formatted_name = '    public '+function_name+'('
formatted_args = ', '.join([(a['name']+': '+shared['vis']['type'](a['type'])) for a in arguments])

wrapper = shared['vis']['TextWrapper'](
    subsequent_indent=' ' * len(formatted_name),
    width=80,
)

formatted_args = '\n'.join(wrapper.wrap(formatted_args))

if '\n' in formatted_args:
    formatted_args += '\n    '

%>${docstring}
${formatted_name}${formatted_args}): void {
${merge("        // ", function_name, "        // Put your game logic here for " + function_name, help=False)}
    }

% endfor
${merge("    // ", "functions", "    // any additional functions you want to add for the HumanPlayer", help=False)}
}
