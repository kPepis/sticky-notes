// Model snippet
function Model(data) {
  var context = this;

  var notes = data || [];

  // Collection of observers
  this.observers = [];

  // Adds an observer to the collection
  this.registerObserver = function(observer) {
    context.observers.push(observer);
  };

  // Method to notify all observers
  this.notifyAll = function() {
    context.observers.forEach(function(observer) {
      observer.update(context);
    });
  };

  this.getNotesData = function() {
    return notes;
  };

  this.addNoteToModel = function(note) {
    notes.push(note);
    context.notifyAll();
  };
}

// View snippet
function View(controller, stage) {
  this.controller = controller;
  this.stage = stage;
  var notesFactory = new NotesFactory();

  document.addEventListener("click", controller.handleEvent);

  this.update = function(context) {
    var notesObject = context.getNotesData(); // syntax: notesObject[noteNumber][propertyName]
    // Creates a note using only the last object in the notes array
    var noteToAppend = notesFactory.create(notesObject[notesObject.length - 1]);
    // Appends the newly created note to the HTML element defined as stage
    stage.appendChild(noteToAppend);
  };
  controller.model.registerObserver(this);
}

// Controller snippet
function Controller(model) {
  var context = this;
  this.model = model;

  //  Event listener interface
  this.handleEvent = function(e) {
    e.stopPropagation();

    switch (e.type) {
      case "click":
        // context.clickHandler(e.target);
        context.clickHandler(e);
        break;
      default:
        console.log(e.target);
    }
  };

  // Get note data
  this.getModelData = function() {
    return context.model.getNotesData();
  };

  // Function to run whenever a click event is registered
  this.clickHandler = function(target) {
    function createNewNote() {
      console.log("A note should be created here.");
      var currentDate = new Date();
      var creationDate = "Note created on " + currentDate.toLocaleString(); // text to insert as creationDate
      var lastEditDate = "Last edit on " + currentDate.toLocaleString(); // text to insert as lastEdit

      var note = {
        title: "",
        content: "",
        index: model.getNotesData().length,
        // color: "color1",
        creationDate: creationDate,
        lastEditDate: lastEditDate
      };

      model.addNoteToModel(note);
      console.log(model.getNotesData());
    }

    function deleteNote(clickedBtn) {
      // var indexToDelete = model.getNotesData()
      console.log(clickedBtn.target);
      clickedBtn.target.parentElement.remove(); // removes containing div element
      // todo adjust indexes of affected objects
    }

    // Classes with associated functions
    var typeOfEvents = {
      "button add": createNewNote,
      "button remove": deleteNote
    };

    // Store class name of the clicked element
    var evClass = target.srcElement.className;

    // Execute function depending on the class of the element that was clicked and notify observer
    if (typeOfEvents.hasOwnProperty(evClass)) {
      typeOfEvents[evClass](target);
      // context.model.notifyAll();
    }

    this.model.data = "";
  };
}

function NotesFactory() {
  this.create = function(note) {
    console.log(note);
    var htmlNoteDiv = document.createElement("div");
    htmlNoteDiv.className = "note";
    htmlNoteDiv.innerHTML =
      '<a href="javascript:" class="button remove">x</a>' +
      '<div class="note_cnt">' +
      '<textarea class="title" placeholder="Enter note title" cols="auto" rows="auto">' +
      note["title"] +
      "</textarea>" +
      '<textarea class="noteContent" placeholder="Enter note text here">' +
      note["content"] +
      "</textarea>" +
      '<textarea name="creationDate" readonly class="creationDate">' +
      note["creationDate"] +
      "</textarea>" +
      '<textarea name="lastEdit" readonly class="lastEdit">' +
      note["lastEditDate"] +
      "</textarea>" +
      "</div>";

    return htmlNoteDiv;
  };
}

document.addEventListener("DOMContentLoaded", main);

function main() {
  // Select the #board div, which will be the stage for our view component (where the model changes will be reflected)
  var board = document.getElementById("board");

  var notesModel = new Model(); // this is the model which will control the sticky notes
  var notesController = new Controller(notesModel); // register the model to a new controller
  var boardView = new View(notesController, board); // register the controller to a view and set a stage
}
