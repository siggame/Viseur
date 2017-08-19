
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var Observable = require("src/core/observable");
var ease = require("src/core/utils").ease;
var SettingsManager = require("src/viseur/settingsManager");

/**
 * @class BaseGameObject - the base class all GameObjects inherit from
 */
var BaseGameObject = Classe(Observable, {
    /**
     * Initializes a BaseGameObject, should be invoked by subclass
     *
     * @param {Object} initialState - fully merged delta state for this object's first existence
     * @param {BaseGame} game - The game this game object is being rendered in
     */
    init: function(initialState, game) {
        Observable.init.call(this);
        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.game = game;
        this.renderer = game.renderer;
    },

    /**
     * should be invoked after the game object's current and next state, prior to rendering
     *
     * @param {Object} current - the current state
     * @param {Object} next - the next state
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    updated: function(current, next, reason, nextReason) {
        // these are all shorthand args sent so we don't have to lookup via this.current and check if it exists
        this._stateUpdated(
            current || next,
            next || current,
            reason || nextReason,
            nextReason || reason
        );
    },

    /**
     * Invoked when the state updates. Intended to be overridden by subclass(es)
     *
     * @private
     * @param {Object} current - the current (most) game state, will be this.next if this.current is null
     * @param {Object} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next) {},

    /**
     * Initializes the PIXI.Container that this GameObject's sprites can go in
     *
     * @param {PIXI.Container} [parent] - the parent container
     * @returns {PIXI.Container} the container freshly initialized for this
     */
    _initContainer: function(parent) {
        var self = this;
        this.container = new PIXI.Container();

        if(parent) {
            this.container.setParent(parent);
        }

        this.container.interactive = true;

        var onClick = function(e) {
            self._clicked(e);
        };

        this.container.on("mouseupoutside", onClick);
        this.container.on("mouseup", onClick);
        this.container.on("touchend", onClick);
        this.container.on("touchendoutside", onClick);

        var onRightClick = function(e) {
            self._rightClicked(e);
        };

        this.container.on("rightup", onRightClick);
        this.container.on("rightupoutside", onRightClick);

        return this.container;
    },

    /**
     * Invoked when this game object's container is clicked
     */
    _clicked: function() {
        var menu = this._getContextMenu();
        if(typeof(menu[0]) === "object") {
            menu[0].callback();
        }
    },

    /**
     * Invoked when this game object's container is right clicked, to pull up its context menu
     *
     * @param {PIXI.Event} event - the pixi even from the right click
     */
    _rightClicked: function(event) {
        var scale = SettingsManager.get("viseur", "resolution-scale") || 1;
        this._showContextMenu(event.data.global.x/scale, event.data.global.y/scale);
    },


    // Context Menus \\

    /**
     * Displays a context menu (right click menu) over this game object
     *
     * @param {number} x - the x coordinate where it should be shown (in pixels)
     * @param {number} y - the y coordinate where it should be shown (in pixels)
     */
    _showContextMenu: function(x, y) {
        this.renderer.showContextMenu(this._getFullContextMenu(), x, y);
    },

    /**
     * Gets the full context menu (_getContextMenu + _getBottomContextMenu) and removes unneeded separators
     *
     * @returns {Array} - Any array of items valid for a ContextMenu
     */
    _getFullContextMenu: function() {
        var menu = this._getContextMenu().concat(this._getBottomContextMenu());

        // pop items off the front that are just separators
        while(menu[0] === "---") {
            menu.shift();
        }

        // pop items off the back that are just separators
        while(menu.last() === "---") {
            menu.pop();
        }

        return menu;
    },

    /**
     * gets the unique context menu items, intended to be overridden by sub classes
     *
     * @returns {Array} - Any array of items valid for a ContextMenu
     */
    _getContextMenu: function() {
        return [];
    },

    /**
     * Gets the bottom part of the context menu to be automatically appended to the regular _getContextMenu part, should be a seperator + Inspect
     *
     * @returns {Array} - Any array of items valid for a ContextMenu
     */
    _getBottomContextMenu: function() {
        var self = this;
        this._bottomContextMenu = this._bottomContextMenu || [
            "---",
            {
                icon: "code",
                text: "Inspect",
                description: "Reveals this GameObject in the Inspector so you can examine variable values.",
                callback: function() {
                    self._emit("inspect", self.id);
                },
            },
        ];

        return this._bottomContextMenu;
    },



    /**
     * Highlights this GameObject
     */
    highlight: function() {
        this._highlighting = true;
        this._highlightAlpha = this._highlightAlpha || 0;
    },

    /**
     * Unhighlights this GameObject
     */
    unhighlight: function() {
        this._highlighting = false;
    },

    /**
     * Renders the GameObject, this is the main method that developers will override in the inheriting class to render them via game logic
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {GameOjectState} current - the current (most) game state, will be this.next if this.current is null
     * @param {GameObjectState} next - the next (most) game state, will be this.current if this.next is null
     */
    render: function(dt, current, next) {
        if(this._highlightAlpha !== undefined) {
            if(!this._uxGraphics) {
                this._initGraphicsForUX();
            }

            if(this._highlightAlpha < 1 && this._highlighting) {
                this._highlightAlpha = Math.min(this._highlightAlpha + 0.05, 1);
            }
            else {
                this._highlightAlpha = Math.max(this._highlightAlpha - 0.05, 0);
            }

            if(this._highlightAlpha >= 1) {
                this.unhighlight();
            }

            this._uxGraphics.clear();
            this._uxGraphics.beginFill(this._uxHighlightColor.hexNumber(), 0); // transparent
            this._uxGraphics.lineStyle(0.1, this._uxHighlightColor.hexNumber(), this._highlightAlpha);

            this._uxGraphics.drawRoundedRect(0, 0, this.container.width, this.container.height, 0.1);
            this._uxGraphics.endFill();
        }

        if(this.container) {
            if(next.logs.length > 0 && SettingsManager.get("viseur", "show-logged-text")) {
                var alpha = 1;
                if(current.logs.length < next.logs.length) {
                    alpha = ease(dt, "cubicInOut"); // fade it in
                }
                // then they logged a string, so show it above their head
                var str = next.logs.last();

                if(!this._logText) {
                    this._logText = this.renderer.newPixiText(str, this.container, {
                        height: 0.25,
                        fill: Color("white"),
                    });
                    this._logText.anchor.set(0.5);
                    this._logText.x = 0.5;
                }

                this._logText.visible = true;
                this._logText.alpha = alpha;
                this._logText.text = str;
            }
            else if(this._logText) {
                this._logText.visible = false;
            }
        }
    },

    _uxHighlightColor: Color().rgb(255, 251, 204), // color to highlight with

    /**
     * Initializes the PIXI objects for drawing a rounded rectangle around the GameObject for highlights
     */
    _initGraphicsForUX: function() {
        this._uxGraphics = new PIXI.Graphics();
        this._uxGraphics.setParent(this.container);
    },

    /**
     * Initializes a bar, such as for a health bar, on this GameObject
     *
     * @param {PIXI.DisplayObject} container - container to put this bar into
     * @param  {Object} [options] - dictionary of options for creating the bar
     */
    _initBar: function(container, options) {
        options = options || {};

        var width = options.width || 1;
        var height = options.height || 0.0667;
        var maxValue = options.maxValue || 1;
        var foregroundColor = options.foregroundColor || Color("#44F444");
        var backgroundColor = options.backgroundColor || Color("black");

        // the health bar
        this._bar = {};
        var barContainer = new PIXI.Container();
        barContainer.setParent(container);

        var background = this.renderer.newSprite("", barContainer);
        background.height = height;
        background.width = width;
        background.filters = [ backgroundColor.colorMatrixFilter() ];

        var foreground = this.renderer.newSprite("", barContainer);
        foreground.height = height;
        foreground.width = width;
        foreground.filters = [ foregroundColor.colorMatrixFilter() ];

        var widthDiff = container.width - width;
        barContainer.position.set(widthDiff/2, 0);

        this._bar = {
            width: width,
            height: height,
            maxValue: maxValue || 1,
            container: barContainer,
            foreground: foreground,
            background: background,
        };
    },

    /**
     * Makes the bar and it's components visible or not
     *
     * @param {boolean} visible - true if they should be visible, false otherwise
     */
    _setBarVisible: function(visible) {
        this._bar.container.visible = visible;
    },

    /**
     * Updates the bar to some new value, will be scaled via the given maxValue set during _initBar
     * @param {number} value - new value to scale to, must be [0, maxValue]
     */
    _updateBar: function(value) {
        this._bar.foreground.width = this._bar.width * (value / this._bar.maxValue);
    },

    /**
     * Recolors the parts of the bar
     * @param {Color} foregroundColor - the Color to recolor the foreground part of the bar to
     * @param {Color} backgroundColor - the Color to recolor the background part of the bar to
     */
    _recolorBar: function(foregroundColor, backgroundColor) {
        if(foregroundColor) {
            this._bar.foreground.filters = [ foregroundColor.colorMatrixFilter() ];
        }

        if(backgroundColor) {
            this._bar.background.filters = [ backgroundColor.colorMatrixFilter() ];
        }
    },

    /**
     * Runs some command on the server, on behalf of this object
     *
     * @param {string} run - the function to run
     * @param {Object} args - key value pairs for the function to run
     * @param {Function} callback - callback to invoke once run, is passed the return value
     */
    _runOnServer: function(run, args, callback) {
        this.game.runOnServer(this, run, args, callback);
    },

    /**
     * Intended to be overridden by classes that have a player color so they can re-color themselves when a player color changes
     * Also invoked after initialization
     */
    recolor: function() {
        // do nothing, if a game object can be recolored, it should override this function
    },
});

module.exports = BaseGameObject;
