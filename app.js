import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

let allData = [], filteredData = [], currentQ, score = 0;
let wordBatch = [], batchIndex = 0, isTestingPhase = false;

initCanvas();
preLoadData();

async function preLoadData() {
    try {
        const snap = await getDocs(collection(db, "kanji"));
        allData = [];
        snap.forEach(doc => allData.push(doc.data()));
        const btn = document.getElementById("startBtn");
        btn.disabled = false;
        btn.innerText = "Start Learning";
        btn.style.background = "#4CAF50";
    } catch (e) { console.error(e); }
}

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
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
    const canvas = document.getElementById("canvas");
    const inputArea = document.getElementById("test-input-area");
    const checkBtn = document.getElementById("checkBtn");
    const clearBtn = document.getElementById("clearBtn");
    const qBox = document.getElementById("question");
    const mBox = document.getElementById("meaning-display");

    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode === "word_practice") {
        if (!isTestingPhase) {
            // --- TEACHING PHASE (First 5 questions) ---
            canvas.style.display = "none";
            inputArea.style.display = "none";
            checkBtn.style.display = "none";
            clearBtn.style.display = "none";
            document.getElementById("nextBtn").style.display = "block"; // Study mode, just click next

            if (wordBatch.length < 5) {
                currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
                wordBatch.push(currentQ);
            } else {
                currentQ = wordBatch[batchIndex];
                batchIndex++;
                if (batchIndex >= 5) { isTestingPhase = true; batchIndex = 0; }
            }
            qBox.innerText = currentQ.kanji;
            mBox.innerHTML = `<b style="color:#4CAF50; font-size:1.5rem;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            // --- TESTING PHASE (Next 5 questions - Typing) ---
            canvas.style.display = "none";
            inputArea.style.display = "block";
            checkBtn.style.display = "block";
            clearBtn.style.display = "none";
            
            currentQ = wordBatch[batchIndex];
            qBox.innerText = currentQ.reading;
            mBox.innerText = "What is the English meaning?";
            document.getElementById("answer-input").value = "";
        }
    } 
    else if (mode === "word_test") {
        // --- RANDOM TYPING MODE ---
        canvas.style.display = "none";
        inputArea.style.display = "block";
        checkBtn.style.display = "block";
        clearBtn.style.display = "none";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        qBox.innerText = currentQ.reading;
        mBox.innerText = "Type the English meaning";
        document.getElementById("answer-input").value = "";
    } 
    else {
        // --- KANJI MODES (Drawing) ---
        canvas.style.display = "block";
        inputArea.style.display = "none";
        checkBtn.style.display = "block";
        clearBtn.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        if (mode === "kanji_test") {
            qBox.innerText = "？";
            mBox.innerHTML = `<b style="color:green; font-size:1.4rem;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            qBox.innerText = currentQ.kanji;
            mBox.innerText = currentQ.meaning_en;
        }
    }
};

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    const isTyping = document.getElementById("test-input-area").style.display === "block";
    let isCorrect = false;

    if (isTyping) {
        const val = document.getElementById("answer-input").value.toLowerCase().trim();
        isCorrect = (val === currentQ.meaning_en.toLowerCase().trim());
        if (isCorrect && mode === "word_practice") {
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
        score += 10;
        document.getElementById("nextBtn").style.display = "block";
    } else {
        resEl.innerText = "❌ Incorrect. Try again!";
        resEl.style.color = "red";
        if (score > 0) score -= 5;
    }
    document.getElementById("score").innerText = score;
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};
window.clearCanvas = clearCanvas;
