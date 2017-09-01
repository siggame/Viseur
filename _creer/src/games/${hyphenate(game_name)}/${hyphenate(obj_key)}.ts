<%include file="functions.noCreer" />// This is a class to represent the ${obj_key} object in the game.
// If you want to render it in the game do so here.<%
parent_classes = list(obj['parentClasses'])
base_object = False
if len(parent_classes) == 0:
    base_object = True
    # its a base object, so figure out which one to grab
    parent_classes.append('BaseGame' if obj_key == 'Game' else 'BaseGameObject')

imports = {
    './state-interfaces': ['I'+obj_key+'State'],
    'src/viseur/game': ['IDeltaReason'],
}

if base_object:
    imports['src/viseur/game'].append(parent_classes[0])

if obj_key == 'Game':
    imports['./settings'] = ['GameSettings']
    imports['./resources'] = ['GameResources']
    imports['./game-object-classes'] = ['GameObjectClasses']
else:
    imports['./game'] = ['Game']
    imports['src/core/ui/context-menu'] = ['MenuItems']
    if not base_object:
        imports['./'+hyphenate(parent_classes[0])] = [parent_classes[0]]

#// figure out if any of our function arguments will require an interface
if obj['functions']:
    for function_name, function_parms in obj['functions'].items():
        for arg in function_parms['arguments']:
            arg_type = shared['vis']['type'](arg['type'])
            if arg_type[0] == 'I': #// then it's an interface
                if arg_type not in imports['./state-interfaces']:
                    imports['./state-interfaces'].append(arg_type)

%>
${shared['vis']['imports'](imports)}
${merge("// ", "imports", "// any additional imports you want can be added here safely between Creer runs", help=False)}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export class ${obj_key} extends ${parent_classes[0]} {
% if obj_key == 'Game':
    /** The static name of this game. */
    public static readonly gameName: string = "${obj['name']}";

    /** The number of players in this game. the players array should be this same size */
    public readonly numberOfPlayers: number = ${obj['numberOfPlayers']};

% endif
    /** The instance of the game this game object is a part of */
    public readonly game: Game;

    /** The current state of the ${obj_key} (dt = 0) */
    public current: I${obj_key}State;

    /** The next state of the ${obj_key} (dt = 1) */
    public next: I${obj_key}State;
% if obj_key == 'Game':

    /** The resource factories that can create sprites for this game */
    public readonly resources = GameResources;

    /** The custom settings for this game */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game */
    public layers = Object.freeze({
${merge("        // ", "layers",
"""        /** Bottom most layer, for background elements */
        background: this.createLayer(),
        /** Middle layer, for moving game objects */
        game: this.createLayer(),
        /** Top layer, for UI elements above the game */
        ui: this.createLayer(),""", help=False)}
    });

    /** Mapping of the class names to their class for all sub game object classes */
    public readonly gameObjectClasses = GameObjectClasses;
% endif

${merge("    // ", "variables", "    // You can add additional member variables here", help=False)}

% if obj_key == 'Game':
${merge("    // ", "public-functions", "    // You can add additional public functions here", help=False)}

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize stuff.
     */
    protected start(state: IGameState): void {
        super.start(state);

${merge("        // ", "start", "        // Initialize your variables here", help=False)}
    }

    /**
     * initializes the background. It is drawn once automatically after this step.
     * @param state the initial state to use the render the background
     */
    protected createBackground(state: IGameState): void {
        super.createBackground(state);

${merge("        // ", "createBackground", "        // Initialize your background here if need be", help=False)}
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected renderBackground(dt: number, current: IGameState, next: IGameState,
                               reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.renderBackground(dt, current, next, reason, nextReason);

${merge("        // ", "renderBackground", "        // update and re-render whatever you initialize in renderBackground", help=False)}
    }

    /**
     * Invoked when the game state updates.
     * @param current the current (most) game state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    protected stateUpdated(current: IGameState, next: IGameState,
                           reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

${merge("        // ", "stateUpdated", "        // update the Game based on its current and next states", help=False)}
    }
% else:
    /**
     * Constructor for the ${obj_key} with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     * @param state the initial state of this ${obj_key}
     * @param game the game this ${obj_key} is in
     */
    constructor(state: I${obj_key}State, game: Game) {
        super(state, game);

        // <<-- Creer-Merge: constructor -->>
        // initialization logic goes here
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Change this to return true to actually render instances of super classes
     * @returns true if we should render game object classes of this instance,
     *          false otherwise which optimizes playback speed
     */
    public shouldRender(): boolean {
${merge("        // ", "should-render", "        return super.shouldRender(); // change this to true to render all instances of this class", help=False)}
    }

    /**
     * Called approx 60 times a second to update and render ${obj_key}
     * instances. Leave empty if it is not being rendered.
     * @param dt a floating point number [0, 1) which represents how
     * far into the next turn that current turn we are rendering is at
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public render(dt: number, current: I${obj_key}State, next: I${obj_key}State,
                  reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.render(dt, current, next, reason, nextReason);

${merge("        // ", "render", "        // render where the " + obj_key + " is", help=False)}
    }

    /**
     * Invoked after when a player changes their color, so we have a
     * chance to recolor this ${obj_key}'s sprites.
     */
    public recolor(): void {
        super.recolor();

${merge("        // ", "recolor", "        // replace with code to recolor sprites based on player color", help=False)}
    }

    /**
     * Invoked when the state updates.
     * @param current the current (most) state, will be this.next if
     * this.current is undefined
     * @param next the next (most) game state, will be this.current if
     * this.next is undefined
     * @param reason the reason for the current delta
     * @param nextReason the reason for the next delta
     */
    public stateUpdated(current: I${obj_key}State, next: I${obj_key}State,
                        reason: IDeltaReason, nextReason: IDeltaReason): void {
        super.stateUpdated(current, next, reason, nextReason);

        // <<-- Creer-Merge: stateUpdated -->>
        // update the ${obj_key} based on its current and next states
        // <<-- /Creer-Merge: stateUpdated -->>
    }

    // NOTE: past this block are functions only used 99% of the time if
    //       the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore everything past here.

% if len(obj['function_names']) > 0:
    // <Joueur functions> --- functions invoked for human playable client

% for function_name in obj['function_names']:
<%
function_parms = dict(obj['functions'][function_name])
returnless = dict(function_parms)

return_type = 'void'
return_description = ''
if function_parms['returns']:
    return_description = function_parms['returns']['description']
    return_type = shared['vis']['type'](function_parms['returns']['type'])
    returnless.pop('returns', None)

function_parms['arguments'].append({
    'name': 'callback',
    'type': {
        'name': '(returned: ' + return_type + ') => void',
        'is_game_object': False,
    },
    'description': 'The callback that eventually returns the return value from the server.' + (' - The returned value is ' + return_description) if return_description else ''

})
docstring = shared['vis']['block_comment']('    ', returnless)

formatted_name = '    public '+function_name+'('
formatted_args = ', '.join([(a['name']+': '+shared['vis']['type'](a['type'])) for a in function_parms['arguments']])

wrapper = shared['vis']['TextWrapper'](
    subsequent_indent=' ' * len(formatted_name),
    width=80,
)

formatted_args = '\n'.join(wrapper.wrap(formatted_args))

if '\n' in formatted_args:
    formatted_args += '\n    '

%>${docstring}
${formatted_name}${formatted_args}): void {
        this.runOnServer("${function_name}", {${', '.join(a['name'] for a in function_parms['arguments'][:-1])}}, callback);
    }

% endfor
    // </Joueur functions>

% endif
${merge("    // ", "public-functions", "    // You can add additional public functions here", help=False)}

    /**
     * Invoked when the right click menu needs to be shown.
     * @returns an array of context menu items, which can be
     *          {text, icon, callback} for items, or "---" for a separator
     */
    protected getContextMenu(): MenuItems {
        const menu = super.getContextMenu();

        // <<-- Creer-Merge: getContextMenu -->>
        // add context items to the menu here
        // <<-- /Creer-Merge: getContextMenu -->>

        return menu;
    }
% endif

${merge("    // ", "protected-private-functions", "    // You can add additional protected/private functions here", help=False)}
}
