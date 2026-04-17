import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { clearCanvas } from "./canvas.js";
import * as KanjiMode from "./kanjiMode.js";
import * as WordMode from "./wordMode.js";

let allData = [], filteredData = [], currentQ, score = 0;
const sounds = { correct: new Audio('...'), wrong: new Audio('...') };

window.startApp = async () => {
    const mode = document.getElementById("mode").value;
    if (mode.includes("word")) WordMode.initWordMode();
    
    // UI Logic and Firebase Loading...
    await loadData();
    filteredData = allData.filter(x => x.level === document.getElementById("level").value);
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    clearCanvas();
    
    if (mode.includes("word")) {
        currentQ = WordMode.getNextWord(filteredData);
        WordMode.renderWordUI(currentQ);
    } else {
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        KanjiMode.renderKanjiQuestion(currentQ, mode);
    }
};

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    let result;

    if (mode.includes("word")) {
        const input = document.getElementById("answer-input").value;
        result = WordMode.checkWordAnswer(currentQ, input);
    } else {
        result = await KanjiMode.handleKanjiCheck(currentQ, mode);
    }

    updateGameState(result);
};

function updateGameState(result) {
    score += result.scoreDelta;
    document.getElementById("score").innerText = score;
    if (result.isCorrect) {
        sounds.correct.play();
        document.getElementById("nextBtn").style.display = "block";
    } else {
        sounds.wrong.play();
    }
}
