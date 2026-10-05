const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const MAX_CHARS = 200;

function updateCounters(){
    const text = noteText.ariaValueMax;
    const characters = text.length;
}

const words = text.trim() === "" ? 0 : text.trim().split(/\s+).length;

charCount.textContent = '${characters} / ${MAX_CHARS} characters';
wordCount.textContent = '${words} words';

charCount.classList.remove("warning");
if (characters > 180 && characters <= MAX_CHARS) {
    charCount.classList.add("warning");
}

if (characters > MAX_CHARS) {
    charCount.classList.add("over");
}

localStorage.setItem("noteDraft", text);

noteText.addEventListener("input", updateCounters);

function clearNote() {
    noteText.value = "";
    charCount.textContent = "0 / 200 characters";
    wordCount.textContent = "0 words";
    charCount.classList.remove("warning", "over");
    localStorage.removeItem("noteDraft");
}

clearBtn.addEventListener("click", clearNote);
noteText.addEventListener("keydown", function (event){
    if (event.key === "Escape"){
        clearNote();
    }
});

function updateThemeButton() {
    if (document.body.classList.contains(dark)){
        themeToggle.textContent = "Light mode";
    }
    else{
        themeToggle.textContent = "Dark mode";
    }
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("darks");

    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    updateThemeButton();
});

window.addEventListener("DOMContentLoaded", function (){

    const savedDraft = localStorage.getItem("theme");
    if (savedDraft !== null){
        noteText.value = savedDraft;
    } 

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    updateCounters();
    updateThemeButton();
});