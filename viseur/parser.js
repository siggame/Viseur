var Classe = require("classe");
var utils = require("core/utils");

var Parser = Classe({
    init: function(constants) {
        this.constants = constants;
    },

    mergeDelta: function(state, delta) {
        var deltaLength = delta[this.constants.DELTA_LIST_LENGTH];

        if(deltaLength !== undefined) { // then this part in the state is an array
            delete delta[this.constants.DELTA_LIST_LENGTH]; // we don't want to copy this key/value over to the state, it was just to signify it is an array
            while(state.length > deltaLength) { // pop elements off the array until the array is short enough. an increase in array size will be added below as arrays resize when keys larger are set
                state.pop();
            }
        }

        for(var key in delta) {
            if(delta.hasOwnProperty(key)) {
                var d = delta[key];
                if(d === this.constants.DELTA_REMOVED) {
                    delete state[key];
                }
                else if(utils.isObject(d) && utils.isObject(state[key])) {
                    this.mergeDelta(state[key], d); // static use in case this function is called statically
                }
                else {
                    if(utils.isObject(d)) {
                        var newState = (d[this.constants.DELTA_LIST_LENGTH] === undefined ? {} : []);
                        state[key] = this.mergeDelta(newState, d);
                    }
                    else {
                        state[key] = d;
                    }
                }
            }
        }

        return state;
    },
});

module.exports = Parser;
