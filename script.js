import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"; // Note: Ensure this matches your firebase version imports

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
  
  // Update the title based on mode
  document.getElementById("modeTitle").innerText = currentMode.replace('_', ' ').toUpperCase();

  await loadData();
  filterData();
  nextQuestion();
};

// BACK
window.goBack = function () {
  document.getElementById("menu").style.display = "block";
  document.getElementById("app").style.display = "none";
};

// LOAD DATA
async function loadData() {
  allData = [];
  try {
    const snapshot = await getDocs(collection(db, "kanji"));
    snapshot.forEach(doc => allData.push(doc.data()));
  } catch (error) {
    console.error("Error loading data from Firestore: ", error);
    alert("Failed to load data. Please check your Firestore rules.");
  }
}

// FILTER
function filterData() {
  filteredData = allData.filter(x => x.level === currentLevel);
  if (filteredData.length === 0) {
    alert("No data found for the selected level.");
  }
}

// NEXT
window.nextQuestion = function () {
  if (filteredData.length === 0) return;

  const i = Math.floor(Math.random() * filteredData.length);
  currentQuestion = filteredData[i];

  document.getElementById("question").innerText = currentQuestion.kanji;
  document.getElementById("answer").value = "";
  document.getElementById("result").innerText = "";
  
  // Issue Fix: Auto-clear canvas for the next question
  window.clearCanvas();
};

// CHECK
window.checkAnswer = function () {
  const ans = document.getElementById("answer").value.toLowerCase().trim();
  const resultEl = document.getElementById("result");

  // Issue Fix: Add color feedback and better string handling
  const isCorrect = ans === currentQuestion.meaning_en.toLowerCase() || 
                    ans === currentQuestion.meaning_np;

  if (isCorrect) {
    resultEl.innerText = "✅ Correct";
    resultEl.style.color = "#4CAF50";
  } else {
    resultEl.innerText = "❌ Correct Answer: " + currentQuestion.meaning_en;
    resultEl.style.color = "#f44336";
  }
};

// ===== CANVAS DRAW (SMOOTHER LOGIC) =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.offsetX,
    y: e.offsetY
  };
}

function startDrawing(e) {
  drawing = true;
  const { x, y } = getXY(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function stopDrawing() {
  drawing = false;
  ctx.closePath();
}

function draw(e) {
  if (!drawing) return;
  if (e.type === 'touchmove') e.preventDefault();

  const { x, y } = getXY(e);
  
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round"; // Issue Fix: Smoother line connections
  ctx.strokeStyle = "#333";

  ctx.lineTo(x, y);
  ctx.stroke();
}

// Event Listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchmove", draw);

// CLEAR
window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
