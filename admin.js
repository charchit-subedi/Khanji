import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("ADMIN JS LOADED");

// BUTTON CLICK
document.getElementById("runBtn").addEventListener("click", runAction);

// MAIN FUNCTION
async function runAction() {

  const level = document.getElementById("level").value;
  const action = document.querySelector('input[name="action"]:checked').value;
  const status = document.getElementById("status");

  // ===== DELETE =====
  if (action === "delete") {
    const snapshot = await getDocs(collection(db, "kanji"));

    let count = 0;
    for (let d of snapshot.docs) {
      if (d.data().level === level) {
        await deleteDoc(doc(db, "kanji", d.id));
        count++;
      }
    }

    status.innerText = `Deleted ${count} ${level} items ❌`;
    return;
  }

  // ===== UPLOAD =====
  const input = document.getElementById("jsonInput").value;

  if (!input.trim()) {
    status.innerText = "⚠️ Paste JSON first!";
    return;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    status.innerText = "❌ Invalid JSON: " + e.message;
    return;
  }

  let count = 0;

  for (let item of data) {
    if (!item.level) item.level = level;

    await addDoc(collection(db, "kanji"), item);
    count++;
  }

  status.innerText = `✅ Uploaded ${count} items`;

  // CLEAR INPUT
  document.getElementById("jsonInput").value = "";
}
