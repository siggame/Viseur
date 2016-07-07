var $ = require("jquery");
var Classe = require("classe");
var Observable = require("core/observable");
var SettingsManager = require("./settingsManager");

/**
 * @classe Joueur - The websocket client to a Cerveau chess game server. Handles i/o with Cerveau, and mostly merging delta states from it.
 */
var Joueur = Classe(Observable, {
    init: function() {
        // we essentially are going to recieve a gamelog that is being streamed to us, so this is a similar structure
        this._gamelog = {
            streaming: true,
            deltas: [],
        };
    },

    getGamelog: function() {
        return this._gamelog;
    },

    connect: function(server, port, gameName, optionalArgs) {
        var self = this;
        server = server || "localhost";
        port = port || 3088;
        var args = optionalArgs || {};

        try {
            this._ws = new WebSocket("ws://" + server + ":" + port);
        }
        catch(err) {
            this.emit("errored", err);
        }

        this._ws.onopen = function() {
            self.send("play", $.extend({
                gameName: gameName,
                requestedSession: optionalArgs.session || "*",
                spectating: optionalArgs.spectating ? true : undefined,
                clientType: "In Browser",
                playerName: optionalArgs.playerName || "Human",
            }, optionalArgs));
        };

        this._ws.onerror = function(err) {
            this.emit("errored", err);
        };

        this._ws.onmessage = function(message) {
            if(SettingsManager.get("viseur", "print-io")) {
                console.log("FROM SERVER <-- ", message.data);
            }

            self.received(JSON.parse(message.data));
        };

        this._ws.onclose = function() {
            self.emit("closed");
        };
    },

    received: function(data) {
        var eventName = data.event.upcaseFirst();

        var funct = this["_autoHandle" + eventName];
        if(funct) {
            funct.call(this, data.data);
        }

        this.emit("event-" + eventName, data.data);
    },

    _autoHandleOver: function(data) {
        this._ws.close();
    },

    _autoHandleLobbied: function(data) {
        this._gamelog.constants = data.constants;
    },

    _autoHandleDelta: function(data) {
        this._gamelog.deltas.push({
            game: data,
        });
    },

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
