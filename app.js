import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

let allData = [], filteredData = [], currentQ, score = 0;
let wordBatch = [], batchIndex = 0, isTestingPhase = false;

const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

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
            btn.style.background = "#4CAF50";
        }
    } catch (e) {
        document.getElementById("startBtn").innerText = "Connection Error";
    }
}

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    // Reset word batch variables
    wordBatch = []; batchIndex = 0; isTestingPhase = false;
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
        handleWordPractice(qBox, mBox, inputArea, canvasArea);
    } else if (mode === "word_test") {
        handleWordTest(qBox, mBox, inputArea, canvasArea);
    } else {
        // Kanji Modes
        inputArea.style.display = "none";
        canvasArea.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        if (mode === "kanji_test") {
            qBox.innerText = "？";
            mBox.innerHTML = `<b style="color:green; font-size:1.5rem;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            qBox.innerText = currentQ.kanji;
            mBox.innerText = currentQ.meaning_en;
        }
    }
};

function handleWordPractice(qBox, mBox, inputArea, canvasArea) {
    if (!isTestingPhase) {
        // Phase 1: Drawing/Learning 5 words
        if (wordBatch.length < 5) {
            let nw = filteredData[Math.floor(Math.random() * filteredData.length)];
            wordBatch.push(nw);
            currentQ = nw;
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
        // Phase 2: Typing Test for those same 5 words
        currentQ = wordBatch[batchIndex];
        qBox.innerText = currentQ.reading;
        mBox.innerText = "What is the English meaning?";
        inputArea.style.display = "block";
        canvasArea.style.display = "none";
        document.getElementById("answer-input").value = "";
    }
}

function handleWordTest(qBox, mBox, inputArea, canvasArea) {
    // Mode: Word Test (Random Furigana -> Type English)
    currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
    qBox.innerText = currentQ.reading;
    mBox.innerText = "Type the English meaning:";
    inputArea.style.display = "block";
    canvasArea.style.display = "none";
    document.getElementById("answer-input").value = "";
}

window.checkAction = async () => {
    const isTyping = document.getElementById("test-input-area").style.display !== "none";
    let isCorrect = false;

    if (isTyping) {
        const val = document.getElementById("answer-input").value.toLowerCase().trim();
        isCorrect = (val === currentQ.meaning_en.toLowerCase().trim());
        if (isCorrect && document.getElementById("mode").value === "word_practice") {
            batchIndex++;
            if (batchIndex >= 5) { isTestingPhase = false; wordBatch = []; batchIndex = 0; }
        }
    } else {
        const candidates = await recognizeHandwriting(getInk());
        isCorrect = candidates.slice(0, 3).includes(currentQ.kanji);
    }

    const resEl = document.getElementById("result");
    if (isCorrect) {
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
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};
window.clearCanvas = clearCanvas;
