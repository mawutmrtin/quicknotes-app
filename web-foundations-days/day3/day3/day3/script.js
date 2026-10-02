const notes = [
  { text: "Buy groceries for the weekend", category: "personal" },
  { text: "Call my family this evening", category: "personal" },
  { text: "Finish the project report", category: "work" },
  { text: "Study JavaScript functions", category: "study" },
  { text: "Review HTML and CSS notes", category: "study" },
];
function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase()),
  );
}
function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest,
  );
}
function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  notes.forEach((note) => {
    if (counts[note.category] !== undefined) {
      counts[note.category]++;
    }
  });
  return counts;
}
function getSummary() {
  const counts = countByCategory();
  return `${notes.length} notes: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}
function isDuplicate(text) {
  const normalizedText = text.trim().replace(/\s+/g, " ").toLowerCase();
  return notes.some((note) => {
    const existingText = note.text.trim().replace(/\s+/g, " ").toLowerCase();
    return existingText === normalizedText;
  });
}
function addNote(text, category) {
  if (typeof text !== "string") {
    console.log("Note was not added: text must be a string.");
    return false;
  }
  const cleanedText = text.trim().replace(/\s+/g, " ");
  if (cleanedText.length < 1 || cleanedText.length > 200) {
    console.log(
      "Note was not added: note must be between 1 and 200 characters.",
    );
    return false;
  }
  if (isDuplicate(cleanedText)) {
    console.log("Note was not added: duplicate note.");
    return false;
  }
  const validCategories = ["personal", "work", "study"];
  if (!validCategories.includes(category)) {
    console.log(
      "Note was not added: category must be personal, work, or study.",
    );
    return false;
  }
  notes.push({ text: cleanedText, category: category });
  console.log("Note added successfully.");
  return true;
}
console.log("Search for 'study':");
console.log(searchNotes("STUDY"));
console.log("Longest note:");
console.log(longestNote());
console.log("Notes by category:");
console.log(countByCategory());
console.log("Summary:");
console.log(getSummary());
console.log("Is 'Call my family this evening' a duplicate?");
console.log(isDuplicate(" call my family this evening "));
console.log("Adding a new note:");
console.log(addNote("Practice JavaScript arrays", "study"));
console.log("Adding a duplicate note:");
console.log(addNote(" PRACTICE JavaScript arrays ", "study"));
console.log("Adding note with invalid category:");
console.log(addNote("Go to the meeting", "finance"));
console.log("Adding empty note:");
console.log(addNote("", "personal"));
console.log("Final summary:");
console.log(getSummary());
