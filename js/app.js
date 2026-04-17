import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

let allData = [], filteredData = [], currentQ, score = 0;
let wordBatch = []; // Stores the 5 words currently being learned
let batchIndex = 0;
let isTestingPhase = false;

const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

initCanvas();

window.startApp = async () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    score = 0;
    wordBatch = [];
    batchIndex = 0;
    isTestingPhase = false;
    document.getElementById("score").innerText = score;
    
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.replace("_", " ").toUpperCase();
    
    await loadData();
    filteredData = allData.filter(x => x.level === level);
    window.nextQuestion();
};

async function loadData() {
    if (allData.length > 0) return;
    const snap = await getDocs(collection(db, "kanji")); // Assuming words are in the same collection
    snap.forEach(doc => allData.push(doc.data()));
}

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");

    if (mode === "word_practice") {
        handleWordPracticeFlow(questionEl, meaningEl, inputArea);
    } else {
        // Standard Kanji Practice/Test Logic
        inputArea.style.display = "none";
        document.getElementById("canvas").style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        // ... (previous Kanji logic)
    }
};

function handleWordPracticeFlow(questionEl, meaningEl, inputArea) {
    if (!isTestingPhase) {
        // --- LEARNING PHASE ---
        if (wordBatch.length < 5) {
            currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
            wordBatch.push(currentQ);
        } else {
            currentQ = wordBatch[batchIndex];
        }

        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `<div style="color: #4CAF50;">${currentQ.reading}</div><div>${currentQ.meaning_en}</div>`;
        inputArea.style.display = "none";
        document.getElementById("nextBtn").style.display = "block";
        
        batchIndex++;
        if (batchIndex > 5) {
            isTestingPhase = true;
            batchIndex = 0;
            document.getElementById("result").innerText = "Time to test! Write the English meanings.";
        }
    } else {
        // --- TESTING PHASE ---
        currentQ = wordBatch[batchIndex];
        questionEl.innerText = currentQ.reading; // Show only Furigana
        meaningEl.innerText = "What is the English meaning?";
        inputArea.style.display = "block";
        document.getElementById("answer-input").value = "";
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("canvas").style.display = "none"; // Hide canvas for text input
    }
}

window.submitWordTest = () => {
    const userAns = document.getElementById("answer-input").value.toLowerCase().trim();
    const resultEl = document.getElementById("result");

    if (userAns === currentQ.meaning_en.toLowerCase()) {
        score += 10;
        sounds.correct.play();
        resultEl.innerText = "✅ Correct!";
        batchIndex++;
        
        if (batchIndex >= 5) {
            resultEl.innerText = "Batch Complete! Next 5 words...";
            wordBatch = [];
            batchIndex = 0;
            isTestingPhase = false;
        }
        window.nextQuestion();
    } else {
        if (score > 0) score -= 5;
        sounds.wrong.play();
        resultEl.innerText = `❌ Wrong. It was "${currentQ.meaning_en}"`;
    }
    document.getElementById("score").innerText = score;
};
