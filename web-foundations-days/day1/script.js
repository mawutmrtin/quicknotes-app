const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const list = document.querySelector("#note-lists");
const count = document.querySelector("#note-count");

const STORAGE_KEY = "quicknotes";

let notes = loadNotes();

function loadNotes(){
    const Saved = localStorage.getItem(STORAGE_KEY);
    return saved? JSON.parse(saved): [];
}

function saveNotes(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function render(){
    list.innerHTML = "";
    notes.forEach((note) =>{
        const li = document.createElement("li");
        li.classList.add("note");
        const text = document.createElement("span");
        text.textContent = note.text;
        const del = document.createElement("button");
        del.textContent = "Delete";

        del.classList.add("delete-btn");
        del.addEventListener("click",() => deleteNote(note.id));

        li.appendChild("text");
        li.appendChild("del");
        li.appendChild("li");

        });
        count.textContent = 
        notes.length === 1 ? "You have 1 Note.": 'You have ${note.length} note.';
}

function addNotes(text){
    notes.push({id: Date.now(), text: text});
    saveNotes();
    render();
}

function deleteNote(id){
    notes = notes.filter((note) => note.id !==id);
    saveNotes();
    render();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.ariaValueMax.trim();
    if (text === "")return;
    addNotes(text);
    input.value = "";
    input.focus();
});

render();