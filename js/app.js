import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";
import * as WordMode from "./wordMode.js";

let allData = [], filteredData = [], currentQ, score = 0;
const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

initCanvas();

// --- PRE-LOAD LOGIC ---
async function preLoadData() {
    try {
        const snap = await getDocs(collection(db, "kanji"));
        allData = [];
        snap.forEach(doc => allData.push(doc.data()));
        
        const btn = document.getElementById("startBtn");
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Start Learning";
            btn.style.background = "#4CAF50"; // Turns Green
        }
    } catch (e) {
        console.error("Load failed", e);
        document.getElementById("startBtn").innerText = "Load Error";
    }
}
preLoadData();

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    if (mode === "word_practice") WordMode.initWordMode();

    score = 0;
    document.getElementById("score").innerText = score;
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.toUpperCase();
    
    filteredData = allData.filter(x => x.level === level);
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode === "word_practice") {
        currentQ = WordMode.getNextWord(filteredData);
        WordMode.renderWordUI(currentQ);
    } else {
        document.getElementById("canvas").style.display = "block";
        document.getElementById("test-input-area").style.display = "none";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        
        if (mode === "kanji_test") {
            document.getElementById("question").innerText = "？";
            document.getElementById("meaning-display").innerHTML = `<b style="color:green">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            document.getElementById("question").innerText = currentQ.kanji;
            document.getElementById("meaning-display").innerText = currentQ.meaning_en;
        }
    }
};

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    const isTyping = document.getElementById("test-input-area").style.display !== "none";
    let result;

    if (isTyping) {
        const input = document.getElementById("answer-input").value;
        result = WordMode.checkWordAnswer(currentQ, input);
    } else {
        const candidates = await recognizeHandwriting(getInk());
        const isCorrect = candidates.slice(0, 3).includes(currentQ.kanji);
        result = { isCorrect, scoreDelta: isCorrect ? 10 : -5 };
    }

    const resultEl = document.getElementById("result");
    if (result.isCorrect) {
        resultEl.innerText = "✅ Correct!";
        resultEl.style.color = "green";
        sounds.correct.play();
        score += result.scoreDelta;
        document.getElementById("nextBtn").style.display = "block";
    } else {
        resultEl.innerText = "❌ Try Again!";
        resultEl.style.color = "red";
        sounds.wrong.play();
        if (score > 0) score += result.scoreDelta;
    }
    document.getElementById("score").innerText = score;
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};
window.clearCanvas = clearCanvas;
