import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

let allData = [], filteredData = [], currentQ, score = 0;
const sounds = {
    correct: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

// Initialize Canvas immediately
initCanvas();

// FIX: Start loading data from Firebase as soon as the script runs
async function preLoadData() {
    try {
        const snap = await getDocs(collection(db, "kanji"));
        snap.forEach(doc => allData.push(doc.data()));
        
        // Data is ready - enable the start button
        const btn = document.getElementById("startBtn");
        btn.disabled = false;
        btn.innerText = "Start Learning";
        btn.style.background = "#4CAF50";
        console.log("Firebase data pre-loaded.");
    } catch (e) {
        console.error("Data load failed:", e);
        document.getElementById("startBtn").innerText = "Load Error (Check Connection)";
    }
}
preLoadData();

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    filteredData = allData.filter(x => x.level === level);
    if (filteredData.length === 0) {
        alert("No data found for this level!");
        return;
    }

    score = 0;
    document.getElementById("score").innerText = score;
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.toUpperCase();
    
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
    
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");

    // Reset UI
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";
    clearCanvas();

    if (mode === "kanji_test") {
        questionEl.innerText = "？";
        meaningEl.innerHTML = `<b style="color:green;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
    } else {
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerText = currentQ.meaning_en;
    }
};

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    const resultEl = document.getElementById("result");
    resultEl.innerText = "Checking...";

    const candidates = await recognizeHandwriting(getInk());

    if (candidates.slice(0, 3).includes(currentQ.kanji)) {
        resultEl.innerText = "✅ Correct!";
        resultEl.style.color = "green";
        sounds.correct.play();
        if (mode.includes("test")) score += 10;
        document.getElementById("nextBtn").style.display = "block";
    } else {
        resultEl.innerText = "❌ Incorrect. Try again!";
        resultEl.style.color = "red";
        sounds.wrong.play();
        if (mode.includes("test") && score > 0) score -= 5;
    }
    document.getElementById("score").innerText = score;
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};

window.clearCanvas = clearCanvas;
