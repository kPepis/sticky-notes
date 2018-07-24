/**
 * A 2-way View Module
 */
var simpleMVC = (function simpleMVC(simple) {
  "use strict";

  // selector is a DOM element that supports .onChanged and .value
  simple.TwoWayView = function simpleTwoWayView(model, selector) {
    this._model = model;
    this._selector = selector;

    // for 2-way binding
    this.onChanged = new simple._Event(this);

    // attach model listeners
    this._model.onSet.attach(() => this.show());

    // attach change listener for two-way binding
    this._selector.addEventListener("change", e =>
      this.onChanged.notify(e.target.value)
    );
  };

  simple.TwoWayView.prototype = {
    show() {
      this._selector.value = this._model.get();
    }
  };

  return simple;
})(simpleMVC || {});
