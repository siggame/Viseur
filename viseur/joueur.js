var $ = require("jquery");
var Classe = require("classe");
var Observable = require("core/observable");
var SettingsManager = require("./settingsManager");

/**
 * @classe Joueur - The websocket client to a Cerveau chess game server. Handles i/o with Cerveau, and mostly merging delta states from it.
 */
var Joueur = Classe(Observable, {
    init: function(args) {
        Observable.init.call(this);

        // we essentially are going to recieve a gamelog that is being streamed to us, so this is a similar structure
        this._gamelog = {
            streaming: true,
            deltas: [],
        };

        if(args) {
            this.connect.apply(this, arguments);
        }
    },

    /**
     * Gets the gamelog this client is streaming
     *
     * @returns {Object} the current gamelog, but it will probably be incomplete
     */
    getGamelog: function() {
        return this._gamelog;
    },

    /**
     * Connect to some Cerveau game server
     *
     * @param {string} [server=localhost] - the location of the server
     * @param {number} [port=3088] - the port at which the server is listening for websocket clients
     * @param {string} gameName - the game to connect to and play
     * @param {Object} [optionalArgs] - optional arguments to send to the game server
     */
    connect: function(server, port, gameName, optionalArgs) {
        var self = this;
        server = server || "localhost";
        port = port || 3088;
        var args = optionalArgs || {};

        this._gamelog.gameName = gameName;

        try {
            this._ws = new WebSocket("ws://" + server + ":" + port);
        }
        catch(err) {
            this.emit("errored", err);
        }

        this._ws.onopen = function() {
            self._emit("connected");

            self.send("play", $.extend({
                gameName: gameName,
                requestedSession: optionalArgs.session || "*",
                spectating: optionalArgs.spectating ? true : undefined,
                clientType: "In Browser",
                playerName: optionalArgs.playerName || "Human",
            }, optionalArgs));
        };

        this._ws.onerror = function(err) {
            this._emit("errored", err);
        };

        this._ws.onmessage = function(message) {
            if(SettingsManager.get("viseur", "print-io")) {
                console.log("FROM SERVER <-- ", message.data);
            }

            self._received(JSON.parse(message.data));
        };

        this._ws.onclose = function() {
            self._emit("closed");
        };
    },

    /**
     * Invoked when we recieve some data from the websocket
     *
     * @param {Object} data - Cerveau interchange formatted data
     */
    _received: function(data) {
        var eventName = data.event.upcaseFirst();

        var funct = this["_autoHandle" + eventName];
        if(funct) {
            funct.call(this, data.data);
        }

        this._emit("event-" + eventName.toLowerCase(), data.data);
    },

    /**
     * Invoked automatically to handle the 'over' events
     *
     * @param {Object} data - game over data
     */
    _autoHandleOver: function(data) {
        this._ws.close();
    },

    /**
     * Invoked automatically to handle the 'over' events
     *
     * @param {Object} data - start data, such as playerID, gameName
     */
    _autoHandleStart: function(data) {
        this._started = true;
    },

    /**
     * Checks if the Joueur has recorded that the game has started
     *
     * @returns {boolean} true if started, false otherwise
     */
    hasStarted: function() {
        return Boolean(this._started);
    },

    /**
     * Invoked automatically to handle the 'lobbied' events
     *
     * @param {Object} data - data about what game session this client is lobbied in, such as 'session' and 'gameName'
     */
    _autoHandleLobbied: function(data) {
        this._gamelog.gameName = data.gameName;
        this._gamelog.gameSession = data.gameSession;
        this._gamelog.constants = data.constants;
    },

    /**
     * Invoked automatically to handle the 'delta' events
     *
     * @param {Object} data - a delta about what changed in the game
     */
    _autoHandleDelta: function(data) {
        this._gamelog.deltas.push({
            game: data,
        });
    },

    /**
     * Sends some event to the Cerveau game server connected to
     *
     * @param {string} eventName - name of the event, should be something Cerveau expects
     * @param {*} [data] - additional data about the event
     */
    send: function(eventName, data) {
        // NOTE: this does not serialize game objects, so don't be sending cycles like other joueurs
        var str = JSON.stringify({
            event: eventName,
            sentTime: (new Date()).getTime(),
            data: data,
        });

        if(SettingsManager.get("viseur", "print-io")) {
            console.log("TO SERVER --> ", str);
        }

        this._ws.send(str);
    },
});

module.exports = Joueur;
