"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (startState, onError) {
    var stateFns = {};

    function start(model) {
        var logger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

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
            logger("dispatch: " + machine.state + ":" + event, data);

            var events = stateFns[machine.state];
            if (!events) return err("transition " + machine.state + ":" + event + " not defined");

            var fn = stateFns[machine.state][event];
            if (!fn) return err("transition " + machine.state + ":" + event + " not defined");

            fn(machine, data);
        }

        function setState(state) {
            logger("transition: " + machine.state + " -> " + state);
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
