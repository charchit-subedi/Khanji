import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// MAIN FUNCTION
window.runAction = async function () {
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
  if (action === "upload") {
    const input = document.getElementById("jsonInput").value;

    if (!input.trim()) {
      status.innerText = "⚠️ Paste JSON first!";
      return;
    }

    let data;
    try {
      data = JSON.parse(input);
    } catch (e) {
      status.innerText = "❌ Invalid JSON!";
      return;
    }

    let count = 0;

    for (let item of data) {
      if (!item.level) item.level = level;

      await addDoc(collection(db, "kanji"), item);
      count++;
    }

    status.innerText = `✅ Uploaded ${count} items`;
  }
};