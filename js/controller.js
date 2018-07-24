/**
 * Controller module
 */
var simpleMVC = (function simpleMVC(simple) {
  "use strict";

  simple.Controller = function SimpleController(model, view) {
    this._model = model;
    this._view = view;

    if (this._view.hasOwnProperty("onChanged")) {
      this._view.onChanged.attach((sender, data) => this.update(data));
    }
  };

  simple.Controller.prototype = {
    update(data) {
      this._model.set(data);
    }
  };

  return simple;
})(simpleMVC || {});
