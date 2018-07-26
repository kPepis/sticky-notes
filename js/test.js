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
  this.notifyAll = function(triggeringFn, args) {
    context.observers.forEach(function(observer) {
      observer.update(context, triggeringFn, args);
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
  document.addEventListener("change", controller.handleEvent);
  document
    .getElementById("searchBox")
    .addEventListener("input", controller.handleEvent);
  // stage.addEventListener(, );

  // noinspection JSUnusedGlobalSymbols
  this.update = function(context, triggeringFn, args) {
    var notesObject = context.getNotesData(); // syntax: notesObject[noteNumber][propertyName]

    if (triggeringFn === "inputEvent") {
      notesObject.forEach(function(note) {
        //  select the note div
        var noteDiv = document.querySelector('[data-id="' + note.index + '"]');
        noteDiv.style.display = note.display;
      });
    }

    if (triggeringFn === "changeEvent") {
      // Update last edit field
      var lastEditField = document.querySelector(
        '[data-id="' + args + '"] .lastEdit'
      );
      lastEditField.value = notesObject[args].lastEditDate;
    }

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

    if (e.type === "input") {
      context.inputHandler(e);
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

    var notesOject = model.getNotesData();
    notesOject.forEach(function(note, idx) {
      note.index = idx;
    });

    notesOject.sort(function(a, b) {
      if (a.index > b.index) return 1;
      if (a.index < b.index) return -1;
      return 0;
    });
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
        lastEditDate: lastEditDate,
        display: "inline-block"
      };

      model.addNoteToModel(note);
    }

    this.inputHandler = function(ev) {
      var notes = model.getNotesData();

      // match only containing notes
      var stringToMatch = ev.target.value;

      notes.forEach(function(note) {
        var found =
          note.title.includes(stringToMatch) ||
          note.content.includes(stringToMatch);

        console.log(found);

        if (found) {
          note.display = "inline-block";
          console.log("found", note.index);
        } else {
          note.display = "none";
          console.log("not found", note.index);
        }

        model.notifyAll("inputEvent");
      });
    };

    // Function to run whenever a change event is registered
    this.changeHandler = function(ev) {
      var notes = model.getNotesData();

      if (ev.target.tagName === "TEXTAREA") {
        // new Date instance
        var currentDate = new Date();

        // string that will appear on textarea
        var newDate = "Last edit on " + currentDate.toLocaleString();

        // Check to see if the modified element was a textarea
        if (ev.srcElement.tagName === "TEXTAREA") {
          // Select containing div of the textarea that triggered the changeEvent
          var containingDivId =
            ev.srcElement.parentElement.parentElement.dataset["id"];

          if (ev.srcElement.className === "title") {
            notes[containingDivId].title = ev.srcElement.value;
          }

          if (ev.srcElement.className === "noteContent") {
            notes[containingDivId].content = ev.srcElement.value;
          }

          notes[containingDivId].lastEditDate = newDate;
          model.notifyAll("changeEvent", containingDivId);
          context.updateLocalStorage();
        }
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

// todo implement drag and drop
function sortable(rootEl, onUpdate) {
  var dragEl;

  // Function responsible for sorting
  function _onDragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";

    var target = evt.target;
    console.log(target.nodeName);

    if (target && target !== dragEl && target.nodeName === "DIV") {
      // Sorting
      rootEl.insertBefore(dragEl, target.nextSibling || target);
    }
  }

  // End of sorting
  function _onDragEnd(evt) {
    evt.preventDefault();

    dragEl.classList.remove("ghost");
    rootEl.removeEventListener("dragover", _onDragOver, false);
    rootEl.removeEventListener("dragend", _onDragEnd, false);

    // Notification about the end of sorting
    onUpdate(dragEl);
  }

  // Sorting starts
  rootEl.addEventListener(
    "dragstart",
    function(evt) {
      dragEl = evt.target; // Remembering an element that will be moved

      // Limiting the movement type
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("Text", dragEl.textContent);

      // Subscribing to the events at dnd
      rootEl.addEventListener("dragover", _onDragOver, false);
      rootEl.addEventListener("dragend", _onDragEnd, false);

      setTimeout(function() {
        // If this action is performed without setTimeout, then
        // the moved object will be of this class.
        dragEl.classList.add("ghost");
      }, 0);
    },
    false
  );
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

  sortable(board, function(item) {
    console.log(item);
  });
}
