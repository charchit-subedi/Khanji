import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, clearCanvas } from "./canvas.js";
import * as KanjiMode from "./kanjiMode.js";
import * as WordMode from "./wordMode.js";

let allData = [], filteredData = [], currentQ, score = 0;

// Initialize the drawing engine immediately
initCanvas();

// Attach functions to 'window' so the HTML buttons can find them
window.startApp = async () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    score = 0;
    document.getElementById("score").innerText = score;

    // Switch screens
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.replace("_", " ").toUpperCase();

    if (mode.includes("word")) WordMode.initWordMode();

    await loadData();
    filteredData = allData.filter(x => x.level === level);
    window.nextQuestion();
};

async function loadData() {
    if (allData.length > 0) return;
    const snap = await getDocs(collection(db, "kanji"));
    snap.forEach(doc => allData.push(doc.data()));
}

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode.includes("word")) {
        currentQ = WordMode.getNextWord(filteredData);
        WordMode.renderWordUI(currentQ);
    } else {
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        KanjiMode.renderKanjiQuestion(currentQ, mode);
        document.getElementById("test-input-area").style.display = "none";
        document.getElementById("canvas").style.display = "block";
    }
};

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    let result;

    if (mode.includes("word") && document.getElementById("test-input-area").style.display !== "none") {
        const input = document.getElementById("answer-input").value;
        result = WordMode.checkWordAnswer(currentQ, input);
    } else if (mode.includes("kanji")) {
        result = await KanjiMode.handleKanjiCheck(currentQ, mode);
    } else {
        // Fallback for Word Practice learning phase (just clicking next)
        window.nextQuestion();
        return;
    }

    score += result.scoreDelta;
    document.getElementById("score").innerText = score;
    document.getElementById("result").innerText = result.isCorrect ? "✅ Correct!" : "❌ Try Again!";
    if (result.isCorrect) document.getElementById("nextBtn").style.display = "block";
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};

window.clearCanvas = clearCanvas;
