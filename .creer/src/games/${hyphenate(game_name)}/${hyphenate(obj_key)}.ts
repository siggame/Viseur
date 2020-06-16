<%include file="functions.noCreer" />// This is a class to represent the ${obj_key} object in the game.
// If you want to render it in the game do so here.<%
parent_classes = list(obj['parentClasses'])
base_object = False
if len(parent_classes) == 0:
    base_object = True
    # its a base object, so figure out which one to grab
    parent_classes.append('BaseGame' if obj_key == 'Game' else 'BaseGameObject')

imports = {
    './state-interfaces': [obj_key+'State', game_name+'Delta'],
    'src/utils': ['Immutable'],
    'src/viseur/game': [],
}

if obj_key == 'GameObject':
    imports['./game'] = ['Game']
    imports["src/viseur/renderer"] = ['ResourcesForGameObject']

if base_object:
    imports['src/viseur/game'].append(parent_classes[0])

if obj_key == 'Game':
    imports['./settings'] = ['GameSettings']
    imports['./resources'] = ['GameResources']
    imports['./game-object-classes'] = ['GameObjectClasses']
    imports['./human-player'] = ['HumanPlayer']
    imports['color'] = [ '* as Color' ]
    imports['src/viseur/renderer'] = ['RendererSize']
else:
    imports['src/viseur'] = ['Viseur']
    imports["src/viseur/game"].append('makeRenderable')
    if not base_object:
        imports['./'+hyphenate(parent_classes[0])] = [parent_classes[0]]

#// figure out if any of our function arguments will require an interface
if obj['functions']:
    for function_name, function_parms in obj['functions'].items():
        for arg in function_parms['arguments']:
            arg_type = shared['vis']['type'](arg['type'])
            if arg_type.endswith('State'):
                if arg_type not in imports['./state-interfaces']:
                    imports['./state-interfaces'].append(arg_type)
        if function_parms['returns']:
            return_type = shared['vis']['type'](function_parms['returns']['type'])
            if return_type.endswith('State'):
                if return_type not in imports['./state-interfaces']:
                    imports['./state-interfaces'].append(return_type)

%>
${shared['vis']['imports'](imports)}
${merge("// ", "imports", "// any additional imports you want can be added here safely between Creer runs", help=False)}

% if obj_key != 'Game':
${merge("// ", "should-render", '''// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = undefined;
''', help=False)}

% endif
/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class ${obj_key} extends ${parent_classes[0] if obj_key == 'Game' else 'makeRenderable({}, SHOULD_RENDER)'.format(parent_classes[0])} {
${merge("    // ", "static-functions", "    // you can add static functions here", help=False)}

% if obj_key == 'Game':
    /** The static name of this game. */
    public static readonly gameName = "${obj['name']}";

    /**
     * The number of players in this game.
     * The players array should be this same size.
     */
    public static readonly numberOfPlayers = ${obj['numberOfPlayers']};

% elif obj_key == 'GameObject':
    /** The instance of the game this game object is a part of. */
    public readonly game!: Game;

    /** The factory that will build sprites for this game object. */
    public readonly addSprite!:
        | ResourcesForGameObject${'<'}Game["resources"]>
        | undefined;

% endif
    /** The current state of the ${obj_key} (dt = 0). */
    public current: ${obj_key}State | undefined;

    /** The next state of the ${obj_key} (dt = 1). */
    public next: ${obj_key}State | undefined;
% if obj_key == 'Game':

    /** The resource factories that can create sprites for this game. */
    public readonly resources = GameResources;

    /** The human player playing this game. */
    public readonly humanPlayer: HumanPlayer | undefined;

    /**
     * The default player colors for this game,
     * there must be one for each player.
     */<%
    lines = []
    for i in range(game['numberOfPlayers']):
        lines.append("        this.defaultPlayerColors[{0}], // Player {0}".format(i))
%>
    public readonly defaultPlayerColors: [${", ".join("Color" for i in range(game['numberOfPlayers']))}] = [
${merge("        // ", "default-player-colors", "\n".join(lines), help=False)}
    ];

    /** The custom settings for this game. */
    public readonly settings = this.createSettings(GameSettings);

    /** The layers in the game. */
    public readonly layers = this.createLayers({
${merge("        // ", "layers",
"""        /** Bottom most layer, for background elements. */
        background: this.createLayer(),
        /** Middle layer, for moving game objects. */
        game: this.createLayer(),
        /** Top layer, for UI elements above the game. */
        ui: this.createLayer(),""", help=False)}
    });

    /**
     * Mapping of the class names to their class for all
     * sub game object classes.
     */
    public readonly gameObjectClasses = GameObjectClasses;
% endif

${merge("    // ", "variables", "    // You can add additional member variables here", help=False)}

% if obj_key == 'Game':
${merge("    // ", "public-functions", "    // You can add additional public functions here", help=False)}

    /**
     * Invoked when the first game state is ready to setup the size of the
     * renderer.
     *
     * @param state - The initialize state of the game.
     * @returns The {height, width} you for the game's size.
     */
    protected getSize(state: GameState): RendererSize {
        return {
${merge("            // ", "get-size", """            width: 10, // Change these. Probably read in the map's width
            height: 10, // and height from the initial state here.""", help=False)}
        };
    }

    /**
     * Called when Viseur is ready and wants to start rendering the game.
     * This is where you should initialize your state variables that rely on
     * game data.
     *
     * @param state - The initialize state of the game.
     */
    protected start(state: GameState): void {
        super.start(state);

${merge("        // ", "start", "        // Initialize your variables here", help=False)}
    }

    /**
     * Initializes the background. It is drawn once automatically after this
     * step.
     *
     * @param state - The initial state to use the render the background.
     */
    protected createBackground(state: GameState): void {
        super.createBackground(state);

${merge("        // ", "create-background", """        // Initialize your background here if need be

        // this is an example of how to render a sprite. You'll probably want
        // to remove this code and the test sprite once actually doing things
        this.resources.test.newSprite({
            container: this.layers.background,
            position: {x: 5, y: 5},
        });

        // this shows you how to render text that scales to the game
        // NOTE: height of 1 means 1 "unit", so probably 1 tile in height
        this.renderer.newPixiText(
            "This game has no\\ngame logic added\\nto it... yet!",
            this.layers.game,
            {
                fill: 0xFFFFFF, // white in hexademical color format
            },
            1,
        );
""", help=False)}
    }

    /**
     * Called approx 60 times a second to update and render the background.
     * Leave empty if the background is static.
     *
     * @param dt - A floating point number [0, 1) which represents how far
     * into the next turn to render at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    protected renderBackground(
        dt: number,
        current: Immutable<GameState>,
        next: Immutable<GameState>,
        delta: Immutable<${game_name}Delta>,
        nextDelta: Immutable<${game_name}Delta>,
    ): void {
        super.renderBackground(dt, current, next, delta, nextDelta);

${merge("        // ", "render-background", "        // update and re-render whatever you initialize in renderBackground", help=False)}
    }

    /**
     * Invoked when the game state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    protected stateUpdated(
        current: Immutable<GameState>,
        next: Immutable<GameState>,
        delta: Immutable<${game_name}Delta>,
        nextDelta: Immutable<${game_name}Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

${merge("        // ", "state-updated", "        // update the Game based on its current and next states", help=False)}
    }
% else:
    /**
     * Constructor for the ${obj_key} with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this ${obj_key}.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: ${obj_key}State, viseur: Viseur) {
        super(state, viseur);

${merge("        // ", "constructor", "        // You can initialize your new {} here.".format(obj_key), help=False)}
    }

    /**
     * Called approx 60 times a second to update and render ${obj_key}
     * instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public render(
        dt: number,
        current: Immutable<${obj_key}State>,
        next: Immutable<${obj_key}State>,
        delta: Immutable<${game_name}Delta>,
        nextDelta: Immutable<${game_name}Delta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

${merge("        // ", "render", "        // render where the " + obj_key + " is", help=False)}
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this ${obj_key}'s sprites.
     */
    public recolor(): void {
        super.recolor();

${merge("        // ", "recolor", "        // replace with code to recolor sprites based on player color", help=False)}
    }

    /**
     * Invoked when this ${obj_key} instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

${merge("        // ", "hide-render", "        // hide anything outside of `this.container`.", help=False)}
    }

    /**
     * Invoked when the state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public stateUpdated(
        current: Immutable<${obj_key}State>,
        next: Immutable<${obj_key}State>,
        delta: Immutable<${game_name}Delta>,
        nextDelta: Immutable<${game_name}Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

${merge("        // ", "state-updated", "        // update the {} based off its states".format(obj_key), help=False)}
    }

${merge("    // ", "public-functions", "    // You can add additional public functions here", help=False)}

% if len(obj['function_names']) > 0:
    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

% for function_name in obj['function_names']:
<%
function_parms = dict(obj['functions'][function_name])
returnless = dict(function_parms)
returnless['arguments'] = returnless['arguments'].copy()

return_type = 'void'
return_description = ''
if function_parms['returns']:
    return_description = function_parms['returns']['description']
    return_type = shared['vis']['type'](function_parms['returns']['type'])
    returnless.pop('returns', None)

returnless['arguments'].append({
    'name': 'callback',
    'type': {
        'name': '(returned: ' + return_type + ') => void',
        'is_game_object': False,
    },
    'description': 'The callback that eventually returns the return value from the server.' + (' - The returned value is ' + return_description) if return_description else ''

})
%>${shared['vis']['function_top'](function_name, returnless)}
        this.runOnServer("${function_name}", ${'{}' if not returnless['arguments'][:-1] else '{{ {} }}'.format(', '.join(a['name'] for a in returnless['arguments'][:-1]))}, callback);
    }

% endfor
    // </Joueur functions>

% endif
% endif
${merge("    // ", "protected-private-functions", "    // You can add additional protected/private functions here", help=False)}
}
