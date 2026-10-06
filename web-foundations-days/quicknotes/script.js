const noteForm = document.getElementById("#note-form");
const noteInput = document.getElementById("#note-input");
const noteCategory = document.getElementById("#note-category");
const searchInput = document.getElementById("#search-input");
const noteList = document.getElementById("#note-list");
const noteCount = document.getElementById("#note-count");
const errorMessage = document.getElementById("#error-message");

let notes = JSON.parse(localStorage.getItem("quicknotes"));

displayNotes();

noteForm.addEventListener("submit", function (event){
    event.preventDefault();

    const text = noteInput.value.trim();
    const category = noteCategory.value;
    if (text === "") {
        errorMessage.textContent = "Please enter a note";
        return;
    }
    errorMessage.textContent = "";

    const newNote = {
        id: Date.now(),
        text: text,
        category: category
    };
    notes.push(newNote);
    saveNotes();
    noteInput.value = "";
    displayNotes();    
});

searchInput.addEventListener("input", function () {
    displayNotes();
});

function displayNotes(){
    const saerchTerm = searchInput.value.toLowerCase().trim();
    notesList.innerHTML = "";

    const filterNotes = notes.filter(function (note) {
        return(
            note.text.toLowerCase().includes(searchTerm) ||
            note.category.toLowerCase().includes(searcTerm)
        );
    });

filterNotes.forEach(function (note) {
const li = document.createElement("li");

li.innerHTML = ` <strong>${note.text}</strong> <span> (${note.category})</span> <button type="button" class="delete-btn">Delete</button> `;

const deleteButton = li.querySelector(".delete-btn"); deleteButton.addEventListener("click", function () { deleteNote(note.id); }); notesList.appendChild(li); });

   updateNoteCount(filteredNotes.length); 
}  
   function deleteNote(id) { notes = notes.filter(function (note) { return note.id !== id; });  
   
   saveNotes(); displayNotes();
 }
function saveNotes() { localStorage.setItem("quickNotes", JSON.stringify(notes)); 

}
function updateNoteCount(count) { if (count === 1) { noteCount.textContent = "You have 1 note"; } else { noteCount.textContent = `You have ${count} notes`;
 }

}

 