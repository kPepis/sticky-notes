// Model snippet
function Model() {
  var context = this;

  var notes = [];

  // Collection of observers
  this.observers = [];

  // Adds an observer to the collection
  this.registerObserver = function(observer) {
    context.observers.push(observer);
  };

  // Method to notify all observers
  this.notifyAll = function(triggeringFn) {
    context.observers.forEach(function(observer) {
      observer.update(context, triggeringFn);
    });
  };

  this.getNotesData = function() {
    return notes;
  };

  this.addNoteToModel = function(note) {
    notes.push(note);
    context.notifyAll("addNoteToModel");
  };
}

// View snippet
function View(controller, stage) {
  var notesFactory = new NotesFactory();

  document.addEventListener("click", controller.handleEvent);
  stage.addEventListener("change", controller.handleEvent);

  // noinspection JSUnusedGlobalSymbols
  this.update = function(context, triggeringFn) {
    var notesObject = context.getNotesData(); // syntax: notesObject[noteNumber][propertyName]

    if (triggeringFn === "addNoteToModel") {
      // Creates a note using only the last object in the notes array
      var noteToAppend = notesFactory.create(
        notesObject[notesObject.length - 1]
      );

      // Appends the newly created note to the HTML element defined as stage
      stage.appendChild(noteToAppend);

      controller.updateNotesIndexes();
    }

    if (triggeringFn === "deleteNote") {
      //  update model index
      notesObject.forEach(function(obj, idx) {
        obj.index = idx;
      });
      controller.index = Math.max(notesObject.length - 1, 0);

      // update data-id attr in html. This is the property deleteNote gets and deletes the appropiate index in the model
      controller.updateNotesIndexes();
    }
  };

  controller.model.registerObserver(this);
}

// Controller snippet
function Controller(model) {
  var context = this;
  this.index = 0;
  this.model = model;

  //  Event listener interface
  this.handleEvent = function(e) {
    e.stopPropagation();

    if (e.type === "click") {
      context.clickHandler(e);
    }

    if (e.type === "change") {
      context.changeHandler(e);
    }
  };

  this.updateLocalStorage = function() {
    localStorage.setItem("notesObject", JSON.stringify(model.getNotesData()));
  };

  this.renderNotes = function(previousNotes) {
    previousNotes.forEach(function(note) {
      model.addNoteToModel(note);
    });
  };

  this.updateNotesIndexes = function() {
    var allNotes = document.getElementsByClassName("note");
    for (var i = 0; i < allNotes.length; i++) {
      allNotes[i].dataset["id"] = i.toString();
    }
  };

  // Function to run whenever a click event is registered
  this.clickHandler = function(target) {
    function createNewNote() {
      var currentDate = new Date();
      var creationDate = "Note created on " + currentDate.toLocaleString(); // text to insert as creationDate
      var lastEditDate = "Last edit on " + currentDate.toLocaleString(); // text to insert as lastEdit

      var note = {
        title: "",
        content: "",
        index: context.index++,
        // color: "color1",
        creationDate: creationDate,
        lastEditDate: lastEditDate
      };

      model.addNoteToModel(note);
    }
    // Function to run whenever a change event is registered
    this.changeHandler = function(target) {
      // new Date instance
      var currentDate = new Date();

      // string that will appear on textarea
      var newDate = "Last edit on " + currentDate.toLocaleString();

      // Check to see if the modified element was a textarea
      if (target.srcElement.tagName === "TEXTAREA") {
        var notes = model.getNotesData();

        // Select containing div of the textarea that triggered the changeEvent
        var containingDivId =
          target.srcElement.parentElement.parentElement.dataset["id"];

        if (target.srcElement.className === "title") {
          notes[containingDivId].title = target.srcElement.value;
        }

        if (target.srcElement.className === "noteContent") {
          notes[containingDivId].content = target.srcElement.value;
        }

        notes[containingDivId].lastEditDate = newDate;

        console.log(target.srcElement.value);

        model.notifyAll("changeEvent");
        context.updateLocalStorage();
        context.renderNotes(notes);

        // notes[containingDivId].title =
        // notes[containingDivId].content
        // notes[containingDivId].lastEditDate
      }
    };

    function deleteNote(clickedBtn) {
      var notes = model.getNotesData();
      var noteId = clickedBtn.target.parentElement.dataset["id"];
      // Remove from model
      notes.splice(noteId, 1);
      clickedBtn.target.parentElement.remove(); // removes containing div element
      model.notifyAll("deleteNote");
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
    var htmlNoteDiv = document.createElement("div");
    htmlNoteDiv.className = "note";
    htmlNoteDiv.draggable = true;
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

    htmlNoteDiv.dataset["id"] = note.index;
    return htmlNoteDiv;
  };
}

document.addEventListener("DOMContentLoaded", main);

function main() {
  // Select the #board div, which will be the stage for our view component (where the model changes will be reflected)
  var board = document.getElementById("board");

  var notesModel = new Model(); // this is the model which will control the sticky notes
  var notesController = new Controller(notesModel); // register the model to a new controller
  new View(notesController, board); // register the controller to a view and set a stage

  // notesObject is stored as a string, so we need to parse it as JSON and restore the notes with that object
  var previousNotes = JSON.parse(localStorage.getItem("notesObject"));
  notesController.renderNotes(previousNotes);

  window.addEventListener("beforeunload", notesController.updateLocalStorage); // save notes whenever page is closed
}
