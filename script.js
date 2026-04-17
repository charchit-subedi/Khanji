import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allData = [];
let filteredData = [];
let currentQuestion;
let currentMode;
let currentLevel;

// START
window.startApp = async function () {
  currentMode = document.getElementById("mode").value;
  currentLevel = document.getElementById("level").value;
  
  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("modeTitle").innerText = currentMode.replace('_', ' ').toUpperCase();

  await loadData();
  filterData();
  updateUIForMode(); // Setup the screen based on the name
  nextQuestion();
};

// 1. UPDATE UI BASED ON NAME
function updateUIForMode() {
  const canvas = document.getElementById("canvas");
  const canvasBtn = document.querySelector('.canvas-controls');
  
  // Only show canvas for Kanji-specific modes
  if (currentMode.includes("kanji")) {
    canvas.style.display = "block";
    if(canvasBtn) canvasBtn.style.display = "block";
  } else {
    canvas.style.display = "none";
    if(canvasBtn) canvasBtn.style.display = "none";
  }
}

// 2. DIFFERENT QUESTION LOGIC FOR EACH NAME
window.nextQuestion = function () {
  if (filteredData.length === 0) return;
  const i = Math.floor(Math.random() * filteredData.length);
  currentQuestion = filteredData[i];

  const qElement = document.getElementById("question");
  const input = document.getElementById("answer");

  // Logic based on the mode name
  switch(currentMode) {
    case "kanji_practice":
    case "kanji_test":
      qElement.innerText = currentQuestion.kanji;
      input.placeholder = "Enter the meaning";
      break;
      
    case "word_practice":
    case "word_test":
      // Show reading/meaning, ask for the Kanji word
      qElement.innerText = currentQuestion.meaning_en;
      input.placeholder = "Type the Kanji word";
      break;

    case "all_test":
    case "jlpt_mock":
      // Mix it up: sometimes show Kanji, sometimes show meaning
      if (Math.random() > 0.5) {
        qElement.innerText = currentQuestion.kanji;
        input.placeholder = "What does this mean?";
      } else {
        qElement.innerText = currentQuestion.meaning_en;
        input.placeholder = "Write the Kanji";
      }
      break;
  }

  input.value = "";
  document.getElementById("result").innerHTML = "";
  clearCanvas();
};

// 3. DIFFERENT CHECK LOGIC
window.checkAnswer = function () {
  const ans = document.getElementById("answer").value.toLowerCase().trim();
  const res = document.getElementById("result");
  
  // Decide what the correct answer should be based on mode
  let isCorrect = false;
  let correctDisplay = "";

  if (currentMode.includes("kanji")) {
    // Checking meanings (English or Nepali)
    const correctEn = currentQuestion.meaning_en.toLowerCase().trim();
    const correctNp = currentQuestion.meaning_np ? currentQuestion.meaning_np.trim() : "";
    isCorrect = (ans === correctEn || ans === correctNp);
    correctDisplay = currentQuestion.meaning_en;
  } else {
    // Checking the Kanji word itself
    isCorrect = (ans === currentQuestion.kanji);
    correctDisplay = currentQuestion.kanji;
  }

  if (isCorrect) {
    res.innerHTML = `<span style="color: green;">✅ Correct: ${correctDisplay}</span>`;
  } else {
    res.innerHTML = `<span style="color: red;">❌ Wrong. Target: ${correctDisplay}</span>`;
  }
};

// ... (Keep your existing loadData, filterData, goBack, and CANVAS functions here) ...
