var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var Observable = require("core/observable");

/**
 * @class BaseGameObject - the base class all GameObjects inherit from
 */
var BaseGameObject = Classe(Observable, {
    /**
     * Initializes a BaseGameObject, should be invoked by subclass
     *
     * @param {Object} initialState - fully merged delta state for this object's first existance
     * @param {BaseGa,e} game - The game this game object is being rendered in
     */
    init: function(initialState, game) {
        Observable.init.call(this);
        this.id = initialState.id;
        this.gameObjectName = initialState.gameObjectName;

        this.game = game;
        this.renderer = game.renderer;
    },

    /**
     * updates the game object's current and next state, prior to rendering
     *
     * @param {Object} current - the current state
     * @param {Object} next - the next state
     */
    update: function(current, next) {
        this.current = current;
        this.next = next;

        this._stateUpdated();
    },

    /**
     * Inoked when the state updates. Intended to be overriden by subclass(es)
     *
     * @private
     */
    _stateUpdated: function() {},

    /**
     * Initializes the PIXI.Container that this GameObject's sprites can go in
     *
     * @param {PIXI.Container} parent - the parent container
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
     */
    _rightClicked: function(event) {
        this._showContextMenu(event.data.global.x, event.data.global.y);
    },


    // Context Menus \\

    /**
     * Displays a context menu (right click menu) over this game object
     */
    _showContextMenu: function(x, y) {
        this.renderer.showContextMenu(this._getFullContextMenu(), x, y);
    },

    /**
     * Gets the full context menu (_getContextMenu + _getBottomContextMenu) and removes unneeded seperators
     *
     * @returns {Array} - Any array of items valid for a ContextMenu
     */
    _getFullContextMenu: function() {
        var menu = this._getContextMenu().concat(this._getBottomContextMenu());

        // pop items off the front that are just seperators
        while(menu[0] === "---") {
            menu.shift();
        }

        // pop items off the back that are just seperators
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
            }
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
     */
    render: function() {
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
    },

    _uxHighlightColor: Color().rgb(255, 251, 204), // color to highlight with

    /**
     * Initializes the PIXI objects for drawing a rounded rectable around the GameObject for highlights
     */
    _initGraphicsForUX: function() {
        this._uxGraphics = new PIXI.Graphics();
        this._uxGraphics.setParent(this.container);
    },
});

module.exports = BaseGameObject;
