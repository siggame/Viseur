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
        var onClick = function() {
            self._clicked();
        };

        this.container = new PIXI.Container();

        if(parent) {
            this.container.setParent(parent);
        }

        this.container.interactive = true;

        this.container.on("mouseupoutside", onClick);
        this.container.on("mouseup", onClick);

        this.container.on("rightup", onClick);
        this.container.on("rightupoutside", onClick);

        this.container.on("touchend", onClick);
        this.container.on("touchendoutside", onClick);

        return this.container;
    },

    /**
     * Invoked when this game object's container is clicked
     */
    _clicked: function() {
        this._emit("clicked");
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
