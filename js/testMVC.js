/**
 * main
 */
var main = function() {
  var model = new simpleMVC.Model(12), // 12 is initial value
    aView = new simpleMVC.TwoWayView(
      model,
      document.getElementById("points-a")
    ),
    aController = new simpleMVC.Controller(model, aView),
    bView = new simpleMVC.OneWayView(
      model,
      document.getElementById("points-b")
    ),
    bController = new simpleMVC.Controller(model, bView);
  // these are for initial show, if not shown some other way
  aView.show();
  bView.show();

  // example of changing the model directly
  window.setTimeout(() => model.set(20), 4000);
};
