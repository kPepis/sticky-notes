/**
 * Event Listeners and notifications module
 */
var simpleMVC = (function simpleMVC(simple) {
  "use strict";

  // sender is the context of the Model or View which originates the event
  simple._Event = function SimpleEvent(sender) {
    this._sender = sender;
    this._listeners = [];
  };

  simple._Event.prototype = {
    // add listener closures to the list
    attach(listener) {
      this._listeners.push(listener);
    },
    // loop through, calling attached listeners
    notify(args) {
      this._listeners.forEach((v, i) => this._listeners[i](this._sender, args));
    }
  };

  return simple;
})(simpleMVC || {});
