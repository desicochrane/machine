"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (startState, onError) {
    var stateFns = {};

    function start(model) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var logging = config.logging === true;

        var machine = { state: null, model: model, setState: setState, inState: inState, dispatch: dispatch };

        function err(msg) {
            if (onError) return onError(machine, msg);
            throw Error(msg);
        }

        function inState() {
            return !!Array.from(arguments).find(function (state) {
                return machine.state === state;
            });
        }

        function dispatch(event, data) {
            if (machine.state === null) err("no start state set");

            if (logging) console.log("dispatch: " + machine.state + ":" + event, data);

            var events = stateFns[machine.state];
            if (!events) err("transition " + machine.state + ":" + event + " not defined");

            var fn = stateFns[machine.state][event];
            if (!fn) err("transition " + machine.state + ":" + event + " not defined");
            fn(machine, data);
        }

        function setState(state) {
            if (logging) console.log("transition: " + machine.state + " -> " + state);
            machine.state = state;
        }

        setState(startState);
        return machine;
    }

    function transition(state, event, fn) {
        if (!stateFns[state]) stateFns[state] = {};
        if (stateFns[state][event]) {
            throw new Error("transition " + state + ":" + event + " already defined");
        }
        stateFns[state][event] = fn;
    }

    return { start: start, transition: transition };
};
