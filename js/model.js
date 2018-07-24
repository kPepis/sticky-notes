/**
 * Simple MVC, 2016 Todd Zebert
 * Model module
 */
var simpleMVC = (function simpleMVC(simple) {
  "use strict";

  simple.Model = function SimpleModel(data) {
    this._data = data;

    this.onSet = new simple._Event(this);
  };

  // define getters and setters
  simple.Model.prototype = {
    // get just returns the value
    get() {
      return this._data;
    },
    // sets the value and notifies any even listeners
    set(data) {
      this._data = data;
      this.onSet.notify({ data: data });
    }
  };

  return simple;
})(simpleMVC || {});
