
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const NOTES_LIMIT = 10;

const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const loadButton = document.getElementById("load-btn");
const statusElement = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let notes = [];

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${response.statusText || "Request failed"}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function showStatus(message, type = "info") {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
}

function setButtonsDisabled(disabled) {
    document.querySelectorAll("button").forEach((button) => {
        button.disabled = disabled;
    });
}

function renderNotes() {
    notesList.replaceChildren();

    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent =
            "No notes available. Load notes or create your first note.";

        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note) => {
        const noteItem = document.createElement("li");
        noteItem.className = "note-card";

        const noteTitle = document.createElement("h3");
        noteTitle.textContent = note.title;

        const noteBody = document.createElement("p");
        noteBody.textContent = note.body;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete note: ${note.title}`
        );

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        noteItem.append(noteTitle, noteBody, deleteButton);
        notesList.appendChild(noteItem);
    });
}

async function loadNotes() {
    setButtonsDisabled(true);
    showStatus("Loading notes...", "info");

    try {
        const data = await request(`${API_URL}?_limit=${NOTES_LIMIT}`);

        notes = data;
        renderNotes();

        if (notes.length === 0) {
            showStatus("No notes found.", "info");
        } else {
            showStatus(
                `Successfully loaded ${notes.length} notes.`,
                "success"
            );
        }
    } catch (error) {
        showStatus(`Unable to load notes: ${error.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}

async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        showStatus("A note title is required.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus("The title must not exceed 100 characters.", "error");
        titleInput.focus();
        return;
    }

    if (!body) {
        showStatus("Note content is required.", "error");
        bodyInput.focus();
        return;
    }

    setButtonsDisabled(true);
    showStatus("Creating note...", "info");

    try {
        const createdNote = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        notes.unshift(createdNote);
        renderNotes();
        noteForm.reset();

        showStatus(
            "Note created successfully. JSONPlaceholder does not permanently save demo changes.",
            "success"
        );
    } catch (error) {
        showStatus(`Unable to create note: ${error.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}

async function deleteNote(noteId) {
    setButtonsDisabled(true);
    showStatus("Deleting note...", "info");

    try {
        await request(`${API_URL}/${encodeURIComponent(noteId)}`, {
            method: "DELETE"
        });

        notes = notes.filter((note) => note.id !== noteId);
        renderNotes();

        showStatus(
            "Delete request successful. The demo server does not permanently change its data.",
            "success"
        );
    } catch (error) {
        showStatus(`Unable to delete note: ${error.message}`, "error");
    } finally {
        setButtonsDisabled(false);
    }
}

noteForm.addEventListener("submit", createNote);
loadButton.addEventListener("click", loadNotes);

renderNotes();
