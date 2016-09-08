var Classe = require("classe");
var utils = require("core/utils");

/**
 * @class Parser - parses delta updates, and creates reverse deltas for gamelogs/cadre communications
 */
var Parser = Classe({
    init: function(constants) {
        this.constants = constants;
    },

    /**
     * merges delta information from a `delta` onto a `state`
     *
     * @param {Object} state - the state to merge `delta` onto
     * @param {Object} delta - the delta formatted information of how to update `state`
     * @returns {Object} state, now delta merged
     */
    mergeDelta: function(state, delta) {
        var deltaLength = delta[this.constants.DELTA_LIST_LENGTH];

        if(deltaLength !== undefined) { // then this part in the state is an array
            //delete delta[this.constants.DELTA_LIST_LENGTH]; // we don't want to copy this key/value over to the state, it was just to signify it is an array
            while(state.length > deltaLength) { // pop elements off the array until the array is short enough. an increase in array size will be added below as arrays resize when keys larger are set
                state.pop();
            }
        }

        for(var key in delta) {
            if(delta.hasOwnProperty(key)) {
                var d = delta[key];
                if(key === this.constants.DELTA_LIST_LENGTH) {
                    continue;
                }
                else if(d === this.constants.DELTA_REMOVED) {
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

    /**
     * Creates a "reverse" delta, which is change in state information to get FROM a state to a PREVIOUS state.
     *
     * @param {Object} state - a fully merged delta state, WITHOUT the delta merged onto it.
     * @param {Object} delta - the delta that would be applied to the state to transform it.
     * @param {Obect} [reverse] - the reverse delta to merge into. Do not directly pass this from first invocation.
     * @returns {Object} the reverse delta. Apply this to a nextState that has had the delta applies to it to get back to the original state.
     */
    createReverseDelta: function(state, delta, reverse) {
        state = state || {};
        reverse = reverse || {};

        for(var key in delta) {
            var deltaValue = delta[key];
            var stateValue = state[key];

            if(key === this.constants.DELTA_LIST_LENGTH) {
                reverse[this.constants.DELTA_LIST_LENGTH] = state.length;
                continue;
            }

            if(!state.hasOwnProperty(key) || stateValue === undefined) {
                reverse[key] = this.constants.DELTA_REMOVED;
                continue;
            }

            if(utils.isObject(deltaValue)) {
                reverse[key] = reverse[key] || {};

                this.createReverseDelta(state[key], deltaValue, reverse[key]);
            }
            else {
                reverse[key] = stateValue;
            }
        }

        return reverse;
    },
});

module.exports = Parser;
