// View snippet
function View(controller, stage) {
  this.controller = controller;
  this.stage = stage;
}

// Model snippet
function Model(data) {
  this.data = data;
}

function Controller(model) {
  this.model = model;

  //  Event listener interface
  this.handleEvent = function(e) {
    e.stopPropagation();
    switch (e.type) {
      case "click":
        this.clickHandler(e.target);
        break;
      default:
        console.log(e.target);
    }
  };

  this.getModelData = function() {
    return this.model.data;
  }
}
