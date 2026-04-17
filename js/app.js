import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

let allData = [], filteredData = [], currentQ, score = 0;
const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

initCanvas();

window.startApp = async () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    score = 0;
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
    const snap = await getDocs(collection(db, "kanji"));
    snap.forEach(doc => allData.push(doc.data()));
}

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
    
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");

    if (mode === "kanji_test") {
        // Test Mode: Hide Kanji, show Furigana and Meaning
        questionEl.innerText = "？"; 
        meaningEl.innerHTML = `
            <div style="font-size: 1.6rem; color: #4CAF50; font-weight: bold; margin-bottom: 8px;">
                ${currentQ.reading || ''}
            </div>
            <div style="font-size: 1.2rem; color: #555;">
                ${currentQ.meaning_en}
            </div>
        `;
    } else {
        // Practice Mode: Show everything including the Kanji
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `
            <div style="font-size: 1.1rem; color: #888;">${currentQ.reading || ''}</div>
            <div>${currentQ.meaning_en}</div>
        `;
    }

    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";
    clearCanvas();
};

window.checkKanji = async () => {
    const mode = document.getElementById("mode").value;
    const resultEl = document.getElementById("result");
    resultEl.innerText = "Checking...";

    const candidates = await recognizeHandwriting(getInk());

    if (candidates.slice(0, 3).includes(currentQ.kanji)) {
        resultEl.innerText = "✅ Correct!";
        resultEl.style.color = "green";
        sounds.correct.play();
        if (mode === "kanji_test") score += 10;
        document.getElementById("nextBtn").style.display = "block";
    } else {
        resultEl.innerText = "❌ Incorrect. Try again!";
        resultEl.style.color = "red";
        sounds.wrong.play();
        if (mode === "kanji_test" && score > 0) score -= 5;
    }
    document.getElementById("score").innerText = score;
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};

window.clearCanvas = clearCanvas;
