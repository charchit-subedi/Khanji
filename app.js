import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

// App Variables
let allData = [], filteredData = [], currentQ, score = 0;
let wordBatch = [], batchIndex = 0, isTestingPhase = false;

const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

// Initialize Canvas & Start Loading Data
initCanvas();
preLoadData();

async function preLoadData() {
    try {
        const snap = await getDocs(collection(db, "kanji"));
        allData = [];
        snap.forEach(doc => allData.push(doc.data()));
        
        const btn = document.getElementById("startBtn");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Start Learning";
            btn.style.background = "#4CAF50"; // Turn Green when ready
        }
    } catch (e) {
        console.error("Firebase Error:", e);
        document.getElementById("startBtn").innerText = "Connection Error";
    }
}

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    // Reset Word Cycle
    wordBatch = [];
    batchIndex = 0;
    isTestingPhase = false;

    score = 0;
    document.getElementById("score").innerText = score;
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.toUpperCase().replace("_", " ");
    
    filteredData = allData.filter(x => x.level === level);
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    const qBox = document.getElementById("question");
    const mBox = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");
    const canvasArea = document.getElementById("canvas");

    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode === "word_practice") {
        handleWordCycle(qBox, mBox, inputArea, canvasArea);
    } else {
        // Kanji Practice/Test Logic
        inputArea.style.display = "none";
        canvasArea.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        
        if (mode === "kanji_test") {
            qBox.innerText = "？";
            mBox.innerHTML = `<b style="color:green; font-size:1.2rem;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            qBox.innerText = currentQ.kanji;
            mBox.innerText = currentQ.meaning_en;
        }
    }
};

function handleWordCycle(qBox, mBox, inputArea, canvasArea) {
    if (!isTestingPhase) {
        // STUDYING PHASE
        if (wordBatch.length < 5) {
            let nextW = filteredData[Math.floor(Math.random() * filteredData.length)];
            wordBatch.push(nextW);
            currentQ = nextW;
        } else {
            currentQ = wordBatch[batchIndex];
            batchIndex++;
            if (batchIndex >= 5) { isTestingPhase = true; batchIndex = 0; }
        }
        qBox.innerText = currentQ.kanji;
        mBox.innerHTML = `<b style="color:#4CAF50">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        inputArea.style.display = "none";
        canvasArea.style.display = "block";
    } else {
        // TESTING PHASE
        currentQ = wordBatch[batchIndex];
        qBox.innerText = currentQ.reading;
        mBox.innerText = "Type the English meaning:";
        inputArea.style.display = "block";
        canvasArea.style.display = "none";
        document.getElementById("answer-input").value = "";
    }
}

window.checkAction = async () => {
    const isTyping = document.getElementById("test-input-area").style.display !== "none";
    let isCorrect = false;

    if (isTyping) {
        const val = document.getElementById("answer-input").value.toLowerCase().trim();
        isCorrect = val === currentQ.meaning_en.toLowerCase().trim();
        if (isCorrect) {
            batchIndex++;
            if (batchIndex >= 5) { isTestingPhase = false; wordBatch = []; batchIndex = 0; }
        }
    } else {
        const candidates = await recognizeHandwriting(getInk());
        isCorrect = candidates.slice(0, 3).includes(currentQ.kanji);
    }

    showResult(isCorrect);
};

function showResult(correct) {
    const resEl = document.getElementById("result");
    if (correct) {
        resEl.innerText = "✅ Correct!";
        resEl.style.color = "green";
        sounds.correct.play();
        score += 10;
        document.getElementById("nextBtn").style.display = "block";
    } else {
        resEl.innerText = "❌ Try Again!";
        resEl.style.color = "red";
        sounds.wrong.play();
        if (score > 0) score -= 5;
    }
    document.getElementById("score").innerText = score;
}

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};
window.clearCanvas = clearCanvas;
