/**
 * Code is isolated in DOMContentLoad event
 */
window.addEventListener("DOMContentLoaded", function() {
  /**
   * Creates a new empty note
   */
  // todo Refactor function to accept arguments for creation date. The noteHtmlCode variable should be deleted and
  // the HTML code template should be included inside here
  function createNewNote() {
    var board = document.querySelector("#board"); // select board
    var creationTxtToReplace = "replaceMeCreation"; // text to easily find where to append creation date
    var editTxtToReplace = "replaceMeEdit"; // text to easily find where to append edit date
    var creationDateTextIndex = noteHtmlCode.search(creationTxtToReplace); // index where creationDate should be
    var lastEditTextIndex = noteHtmlCode.search(editTxtToReplace); // index where lastEdit should be
    var helper = creationDateTextIndex + creationTxtToReplace.length; // make code easier to read

    var currentDate = new Date(); // new Date instance
    var creationDate = "Note created on " + currentDate.toLocaleString(); // text to insert as creationDate
    var lastEditDate = "Last edit on " + currentDate.toLocaleString();  // text to insert as lastEdit

    // Complete string to insert in #board inner HTML code
    // This is where I would love to use template strings :(
    board.innerHTML +=
      noteHtmlCode.substring(0, creationDateTextIndex) +
      creationDate +
      "</textarea>" +
      noteHtmlCode.substring(helper + "</textarea>".length, lastEditTextIndex) +
      lastEditDate +
      noteHtmlCode.substring(lastEditTextIndex + editTxtToReplace.length);
  }

  /**
   * Deletes a note
   * @param clickedBtn Button associated with the noteDiv that will be deleted
   * todo Check how to implement this in IE
   */
  function deleteNote(clickedBtn) {
    // Remove the parentElement of the remove button, which is the div containing the note formatting
    clickedBtn.target.parentElement.remove();
  }

  /**
   * Check if storage is available (code from MDN)
   * @param type The type of storage you want to check for. Possible values: "localStorage" or "sessionStorage".
   * @returns {boolean}
   */
  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0
      );
    }
  }

  /**
   * Updates the content stored in localStorage
   */
  // todo this should save an object containing the notes info... not the HTML code itself. Notes then should be
  // recreated using the info in this object when the page refreshes
  function updateLocalStorage() {
    localStorage.setItem(
      "noteContent",
      document.querySelector("#board").innerHTML
    );
  }

  // HTML code to be inserted as a new note
  var noteHtmlCode =
    '<div class="note">' +
    '<a href="javascript:" class="button remove">x</a>' +
    '<div class="note_cnt">' +
    '<textarea class="title" placeholder="Enter note title" cols="auto" rows="auto"></textarea>' +
    '<textarea class="noteContent" placeholder="Enter note text here"></textarea>' +
    '<textarea name="creationDate" readonly class="creationDate">replaceMeCreation</textarea>' +
    '<textarea name="lastEdit" readonly class="lastEdit">replaceMeEdit</textarea>' +
    "</div>" +
    "</div>";

  // Check if there are any existing notes in localStorage
  if (storageAvailable("localStorage")) {
    if (localStorage.getItem("noteContent")) {
      var board = document.querySelector("#board"); // select board
      board.innerHTML += localStorage.getItem("noteContent"); // restore previous notes
    }
  }

  /**
   * Event listener used for clicks. Calls corresponding function according to the type of button that was pressed
   */
  document.addEventListener("click", function(ev) {
    // Classes with associated functions
    var typeOfEvents = {
      "button add": createNewNote,
      "button remove": deleteNote
    };

    // Store class name of the clicked element
    var evClass = ev.srcElement.className;

    // Execute function depending on the class of the element that was clicked
    if (typeOfEvents.hasOwnProperty(evClass)) typeOfEvents[evClass](ev);
  });

  /**
   * Saves edits on notes whenever they are changed
   */
  document.addEventListener("change", function(ev) {
    // new Date instance
    var currentDate = new Date();

    // string that will appear on textarea
    var lastEditDate = "Last edit on " + currentDate.toLocaleString();

    // Check to see if the modified element was a textarea
    if (ev.srcElement.tagName === "TEXTAREA") {
      // update the textarea content
      ev.srcElement.innerHTML = ev.target.value;

      // Get lastEdit element
      var lastEditTxtarea = ev.srcElement.parentElement.getElementsByClassName(
        "lastEdit"
      );

      // update lastEditDate
      lastEditTxtarea[0].innerHTML = lastEditDate;

      // update localStorage
      updateLocalStorage();
    }
  });

  /**
   * Event listener to save current notes and their content whenever browser is closed.
   */
  window.addEventListener("beforeunload", updateLocalStorage);
});
