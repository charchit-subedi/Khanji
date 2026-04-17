// ===== IMPORT FIREBASE =====
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== GLOBAL VARIABLES =====
let allData = [];
let filteredData = [];
let currentQuestion = null;
let currentMode = "";
let currentLevel = "";
let questionIndex = 0;
let score = 0;

// ===== START APP =====
window.startApp = async function () {
  currentMode = document.getElementById("mode").value;
  currentLevel = document.getElementById("level").value;

  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("modeTitle").innerText =
    currentMode + " (" + currentLevel + ")";

  await loadData();
  filterData();
  nextQuestion();
};

// ===== GO BACK =====
window.goBack = function () {
  document.getElementById("menu").style.display = "block";
  document.getElementById("app").style.display = "none";
};

// ===== LOAD DATA FROM FIREBASE =====
async function loadData() {
  allData = [];

  const querySnapshot = await getDocs(collection(db, "kanji"));
  querySnapshot.forEach((doc) => {
    allData.push(doc.data());
  });
}

// ===== FILTER DATA BY LEVEL =====
function filterData() {
  filteredData = allData.filter(item => item.level === currentLevel);

  // JLPT mock → mix limited questions
  if (currentMode === "jlpt_mock") {
    filteredData = shuffle(filteredData).slice(0, 20);
    questionIndex = 0;
    score = 0;
  }
}

// ===== NEXT QUESTION =====
window.nextQuestion = function () {
  document.getElementById("result").innerText = "";
  document.getElementById("answer").value = "";

  if (currentMode === "jlpt_mock") {
    if (questionIndex >= filteredData.length) {
      showFinalScore();
      return;
    }
    currentQuestion = filteredData[questionIndex];
    questionIndex++;
  } else {
    const randomIndex = Math.floor(Math.random() * filteredData.length);
    currentQuestion = filteredData[randomIndex];
  }

  showQuestion();
};

// ===== SHOW QUESTION =====
function showQuestion() {
  const q = document.getElementById("question");

  if (currentMode.includes("kanji")) {
    q.innerText = currentQuestion.kanji;
  } else if (currentMode.includes("word")) {
    q.innerText = currentQuestion.reading || currentQuestion.kanji;
  } else if (currentMode === "all_test" || currentMode === "jlpt_mock") {
    q.innerText = Math.random() > 0.5
      ? currentQuestion.kanji
      : currentQuestion.reading || currentQuestion.kanji;
  }
}

// ===== CHECK ANSWER =====
window.checkAnswer = function () {
  const userAnswer = document.getElementById("answer").value.trim().toLowerCase();

  const correctEn = currentQuestion.meaning_en.toLowerCase();
  const correctNp = currentQuestion.meaning_np;

  if (userAnswer === correctEn || userAnswer === correctNp) {
    document.getElementById("result").innerText = "✅ Correct!";
    if (currentMode === "jlpt_mock") score++;
  } else {
    document.getElementById("result").innerText =
      "❌ Wrong! → " + currentQuestion.meaning_en;
  }
};

// ===== FINAL SCORE (MOCK TEST) =====
function showFinalScore() {
  document.getElementById("question").innerText = "Test Finished!";
  document.getElementById("result").innerText =
    "Score: " + score + " / " + filteredData.length;
}

// ===== SHUFFLE FUNCTION =====
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ===== CANVAS DRAWING =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// ===== CLEAR CANVAS =====
window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};