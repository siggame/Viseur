// Tournament - A WS connection to a Chesser-Master tournament server
var Classe = require("classe");
var Observable = require("src/core/observable");
var SettingsManager = require("./settingsManager");
var Viseur = null;

var Tournament = Classe(Observable, {
    /**
     * Connect to a remote tournament server
     *
     * @param {Object} args - connection arguments
     * @param {string} args.server - server to connection to via websockets
     * @param {number} args.port - port for the server
     * @param {string} args.playerName - name for the human player, must match exactly as the one on the tournament server
     */
    connect: function(args) {
        Viseur = require("src/viseur");

        var self = this;
        try {
            this.ws = new WebSocket("ws://" + args.server + ":" + args.port);
        }
        catch(err) {
            this._emit("error", err);
        }

        this.ws.onopen = function() {
            self.connected = true;
            self._emit("connected");

            self.send("register", {
                type: "Viseur",
                name: args.playerName,
                password: args.password || "ReplaceMe",
            });
        };

        this.ws.onerror = function(err) {
            self._emit("error", err);
        };

        this.ws.onmessage = function(message) {
            if(SettingsManager.get("viseur", "print-io")) {
                /* eslint-disable no-console */
                console.log("FROM TOURNAMENT <-- ", message.data);
                /* eslint-enable no-console */
            }

            self._received(JSON.parse(message.data));
        };

        this.ws.onclose = function() {
            self._emit("closed");
        };
    },

    /**
     * sends an event to the server
     *
     * @param {string} eventName - name of the event
     * @param {Object} data - data about the event
     */
    send: function(eventName, data) {
        var str = JSON.stringify({
            event: eventName,
            data: data,
        });

        if(SettingsManager.get("viseur", "print-io")) {
            /* eslint-disable no-console */
            console.log("TO TOURNAMENT --> ", str);
            /* eslint-enable no-console */
        }

        this.ws.send(str);
    },

    /**
     * Invoked when we recieve some data from the server
     *
     * @param {Object} data - data recieved from the server
     * @param {string} data.event - event name
     * @param {Object} data.data - event data
     */
    _received: function(data) {
        var callbackName = "_on" + data.event.upcaseFirst();

        if(!this[callbackName]) {
            throw new Error("unexpected tournament callback ''{}'".format(callbackName));
        }

        this[callbackName].call(this, data.data);
    },



    // --- On Recieved Callbacks --- \\

    /**
     * Invoked on a 'message' event
     *
     * @param {string} data - message sent from the server
     */
    _onMessage: function(data) {
        this._emit("messaged", data);
    },

    /**
     * Invoked on a 'play' event
     *
     * @param {Object} data - data on what game server to connect to for bridging the human playable connection
     */
    _onPlay: function(data) {
        this._emit("playing", data);
        Viseur.playAsHuman(data.server, data.port, data.game, data);
    },

    /**
     * Closes the websocket connection
     */
    close: function() {
        this.ws.close();
    },

});

module.exports = Tournament;
