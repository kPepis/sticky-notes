// Model snippet
function Model() {
  var context = this;

  this.notes = [];

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
    return context.notes;
  };

  this.addNoteToModel = function(note) {
    context.notes.push(note);
    context.notifyAll("addNoteToModel");
  };

  Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
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
        // noinspection JSCheckFunctionSignatures
        var noteDiv = document.querySelector('[data-id="' + note.index + '"]');
        noteDiv.style.display = note.display;
      });
    }

    if (triggeringFn === "changeEvent") {
      // Update last edit field
      // noinspection JSCheckFunctionSignatures
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
  this.undoStack = [];
  this.lastEditedNoteValue = "";
  this.lastEditedNoteTitle = "";
  this.lastChangeIndex = 0;
  this.revertMoveFrom = 0;
  this.revertMoveTarget = 0;

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
    var board = document.getElementById("board");
    while (board.firstChild) {
      board.removeChild(board.firstChild);
    }

    model.notes = [];

    previousNotes.forEach(function(note) {
      model.addNoteToModel(note);
    });
  };

  this.updateNotesIndexes = function() {
    var allNotes = document.getElementsByClassName("note");
    var notesObject = model.getNotesData();

    for (var i = 0; i < allNotes.length; i++) {
      allNotes[i].dataset["id"] = i.toString();
    }

    notesObject.forEach(function(note, idx) {
      note.index = idx;
    });

    notesObject.sort(function(a, b) {
      if (a.index > b.index) return 1;
      if (a.index < b.index) return -1;
      return 0;
    });
  };

  // Function to run whenever a click event is registered
  this.clickHandler = function(target) {
    var className = target.target.className;
    if (className === "noteContent") {
      context.lastChangeIndex =
        target.target.parentElement.parentElement.dataset["id"];
      context.lastEditedNoteTitle = target.target.previousSibling.value;
      context.lastEditedNoteValue = target.target.value;
    }
    if (className === "title") {
      context.lastChangeIndex =
        target.target.parentElement.parentElement.dataset["id"];
      context.lastEditedNoteTitle = target.target.value;
      context.lastEditedNoteValue = target.target.nextSibling.value;
    }

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
      context.undoStack.push(deleteNote);
    }

    function undoLastAction() {
      var lastAction = context.undoStack.pop();

      if (typeof lastAction === "function") lastAction();

      var notes = model.getNotesData();

      if (lastAction === "recreateNote") {
        notes.splice(context.lastDeletedNote.index, 0, context.lastDeletedNote);
        context.updateNotesIndexes();
        context.renderNotes(notes);
      }

      if (lastAction === "undoEdit") {
        notes[context.lastChangeIndex].content = context.lastEditedNoteValue;
        notes[context.lastChangeIndex].title = context.lastEditedNoteTitle;
        context.updateLocalStorage();
        context.renderNotes(notes);
      }

      if (lastAction === "undoMove") {
        notes.move(context.revertMoveFrom, context.revertMoveTarget);
        context.renderNotes(notes);
      }
    }

    this.inputHandler = function(ev) {
      var notes = model.getNotesData();

      // match only containing notes
      var stringToMatch = ev.target.value;

      notes.forEach(function(note) {
        var found =
          note.title.includes(stringToMatch) ||
          note.content.includes(stringToMatch);

        if (found) {
          note.display = "inline-block";
        } else {
          note.display = "none";
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

          // context.lastEditedNoteValue = ev.srcElement.value;
          // context.lastEditedNoteIndex = containingDivId;

          notes[containingDivId].lastEditDate = newDate;
          model.notifyAll("changeEvent", containingDivId);

          context.undoStack.push("undoEdit");
          context.updateLocalStorage();
        }
      }
    };

    function deleteNote(clickedBtn) {
      var notes = model.getNotesData();
      var noteId;
      var toRemove;
      // clickedBtn
      //   ? (noteId = clickedBtn.target.parentElement.dataset["id"])
      //   : notes.length - 1;
      if (clickedBtn) {
        noteId = clickedBtn.target.parentElement.dataset["id"];
        toRemove = clickedBtn.target.parentElement;
      } else {
        var notesNodes = document.querySelectorAll(".note");
        toRemove = notesNodes[notesNodes.length - 1];
        noteId = notes.length - 1;
      }

      context.lastDeletedNote = notes[noteId];

      notes.splice(noteId, 1); // updates notes object
      toRemove.remove(); // updates DOM
      model.notifyAll("deleteNote");
      context.undoStack.push("recreateNote");
    }

    // Classes with associated functions
    var typeOfEvents = {
      "button add": createNewNote,
      "button remove": deleteNote,
      "button undo": undoLastAction
    };

    // Store class name of the clicked element
    var evClass = target.srcElement.className;

    // Execute function depending on the class of the element that was clicked and notify observer
    if (typeOfEvents.hasOwnProperty(evClass)) typeOfEvents[evClass](target);

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

function sortable(rootEl, onUpdate, notesObject) {
  var dragEl;
  var fromPosition;

  // Function responsible for sorting
  function _onDragOver(evt) {
    evt.preventDefault();
  }

  // End of sorting
  function _onDrop(evt) {
    evt.preventDefault();

    var target = evt.target;

    dragEl.classList.remove("ghost");
    rootEl.removeEventListener("dragover", _onDragOver, false);
    rootEl.removeEventListener("drop", _onDrop, false);

    // Drop the element
    if (target && target !== dragEl) rootEl.insertBefore(dragEl, target);

    // Notification about the end of sorting
    onUpdate.forEach(function(item) {
      if (typeof item === "function") item();
      else item.undoStack.push("undoMove");
    });

    var targetPosition = parseInt(target.dataset["id"]);

    onUpdate[1].revertMoveFrom = targetPosition - 1;
    onUpdate[1].revertMoveTarget = fromPosition;
    notesObject.move(fromPosition, targetPosition - 1);
  }

  // Sorting starts
  rootEl.addEventListener(
    "dragstart",
    function(evt) {
      dragEl = evt.target; // Remembering an element that will be moved
      fromPosition = parseInt(evt.target.dataset["id"]);
      // console.log(evt.target.dataset["id"]);
      // console.log(dragEl);

      // Limiting the movement type
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("text/html", dragEl);

      // Add class for custom styling of element while dragging
      dragEl.classList.add("ghost");

      // Subscribing to the events at dnd
      rootEl.addEventListener("dragover", _onDragOver, false);
      rootEl.addEventListener("drop", _onDrop, false);
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

  sortable(
    board,
    [notesController.updateNotesIndexes, notesController],
    notesModel.getNotesData()
  );
}
