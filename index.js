"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Machine;
exports.Dot = Dot;
exports.Transition = void 0;

function Machine(def, data) {
  var machine = {
    data: data,
    state: def.__start__
  };
  Object.keys(def).filter(function (k) {
    return k !== '__start__';
  }).forEach(function (stateName) {
    Object.keys(def[stateName]).forEach(function (eventName) {
      machine[eventName] = function (args) {
        var _def$machine$state$ev = def[machine.state][eventName],
            state = _def$machine$state$ev.state,
            handler = _def$machine$state$ev.handler;
        machine.state = state;
        handler && handler(machine, args);
      };
    });
  });
  return machine;
}

var Transition = function Transition(state, handler) {
  return {
    state: state,
    handler: handler
  };
};

exports.Transition = Transition;

function Dot(def) {
  var seen = {};
  var result = '';

  function walk(stateName) {
    if (seen[stateName]) return;
    seen[stateName] = true;
    var stateObj = def[stateName];
    Object.keys(stateObj).forEach(function (eventName) {
      result += "  \"".concat(stateName, "\" -> \"").concat(stateObj[eventName].state, "\" [label=\"").concat(eventName, "\"]\n");
      walk(stateObj[eventName].state);
    });
  }

  walk(def.__start__);
  return "Digraph {\n  \"__start__\" [shape=point]\n  \"__start__\" -> ".concat(def.__start__, "\n\n").concat(result, "}");
}
