/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

// These are the interfaces for all the states in this game
<%include file="functions.noCreer" />import {
    BaseGame,
    BaseGameObject,
    BasePlayer,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import {
    GameObjectInstance,
    GameSpecificDelta,
} from "src/viseur/game/base-delta";

// -- Game State Interfaces -- \\\
% for game_obj_name in (['Game'] + game_obj_names):
<%

delta_objs = dict(game_objs)
delta_objs['AI'] = ai

def state_obj_type(obj):
    t = shared['vis']['type'](obj['type'], use_game_object_states=False)
    if obj['type']['is_game_object']:
        t = 'GameObjectInstance<'+t+'State>'
    return t

game_obj = None
if game_obj_name == 'Game':
    game_obj = game
else:
    game_obj = game_objs[game_obj_name]

parent_classes = []
for p in game_obj['parentClasses']:
    parent_classes.append(p + 'State')

if game_obj_name == 'Player':
    parent_classes.append('BasePlayer')
elif game_obj_name == 'GameObject':
    parent_classes.append('BaseGameObject')
elif game_obj_name == 'Game':
    parent_classes.append('BaseGame')

%>
${shared['vis']['block_comment']('', game_obj['description'])}
export interface ${game_obj_name}State extends ${', '.join(parent_classes)} {${'}' if not game_obj['attribute_names'] else ''}
% if game_obj['attribute_names']:
%     for i, attr_name in enumerate(game_obj['attribute_names']):
<%
    attrs = game_obj['attributes'][attr_name]
    #if 'serverPredefined' in attrs and attrs['serverPredefined']:
    #    continue
    field_dec = '    {}:'.format(attr_name)
    type_str = shared['vis']['type'](attrs['type'])
    one_line = '{} {};'.format(field_dec, type_str)
    if len(one_line) > 80:
        one_line = field_dec
        indent = '        '
        if 'literals' in attrs['type'] and attrs['type']['literals']:
            indent = ''
            literals = list(attrs['type']['literals'])
            if attrs['type']['name'] == 'string':
                literals = [ '"{}"'.format(l) for l in literals ]
            type_str = '\n'.join(['        | {}'.format(l) for l in literals])
        one_line += '\n' + indent + type_str + ';'
%>${'\n' if i > 0 else ''}${shared['vis']['block_comment']('    ', attrs['description'])}
${one_line}
%     endfor
}
% endif
% endfor

// -- Run Deltas -- \\\
<% delta_names = []%>
% for game_obj_name in game_obj_names + ['AI']:
%   for function_name in sorted(delta_objs[game_obj_name]['functions']):
<%
        is_ai = game_obj_name == 'AI'
        deltaName = game_obj_name + upcase_first(function_name) + ('Finished' if is_ai else 'Ran') + 'Delta'
        delta_names.append(deltaName)

        function_parms = delta_objs[game_obj_name]['functions'][function_name]
        function_returns = function_parms['returns'] if function_parms['returns'] else {
            'description': 'This run delta does not return a value.',
            'type': {
                'name': 'void',
                'is_game_object': False,
            },
        }

%>${shared['vis']['block_comment'](
    '',
    "The delta about what happened when a '" + game_obj_name + "' ran their '" + function_name + "' function."
)}
export type ${deltaName} = ${'Finished' if is_ai else 'Ran'}Delta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        ${'order' if is_ai else 'run'}: {
%           if not is_ai:
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<${game_obj_name}State>;

%           endif
            /** The name of the function of the caller to run. */
            ${'name' if is_ai else 'functionName'}: "${function_name}";

            /**
             * The arguments to ${game_obj_name}.${function_name},
             * as a ${'positional array of arguments send to the AI' if is_ai else 'map of the argument name to its value'}.
             */
%           if function_parms['arguments']:
            args: {
%               for i, arg in enumerate(function_parms['arguments']):
${shared['vis']['block_comment']('                ', arg['description'])}
                ${i if is_ai else arg['name']}: ${state_obj_type(arg)};
%               endfor
            };
%           else:
            args: {};
%           endif
        };

${shared['vis']['block_comment'](
        '        ',
        function_returns['description']
)}
        returned: ${state_obj_type(function_returns)};
    };
};

%   endfor
% endfor
/** All the possible specific deltas in ${game_name}. */
export type ${game_name}SpecificDelta =
% for i, delta_name in enumerate(delta_names):
    | ${delta_name}${';' if i+1 == len(delta_names) else ''}
% endfor

/** The possible delta objects in ${game_name}. */
export type ${game_name}Delta = GameSpecificDelta<${game_name}SpecificDelta>;
