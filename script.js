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
  const snapshot = await getDocs(collection(db, "kanji"));
  snapshot.forEach(doc => allData.push(doc.data()));
}

// FILTER
function filterData() {
  filteredData = allData.filter(x => x.level === currentLevel);
}

// NEXT
window.nextQuestion = function () {
  if (filteredData.length === 0) return;
  const i = Math.floor(Math.random() * filteredData.length);
  currentQuestion = filteredData[i];
  document.getElementById("question").innerText = currentQuestion.kanji;
  document.getElementById("answer").value = "";
  document.getElementById("result").innerText = "";
  clearCanvas();
};

// CHECK (Includes Nepali and English support)
window.checkAnswer = function () {
  const ans = document.getElementById("answer").value.toLowerCase().trim();
  const correctEn = currentQuestion.meaning_en.toLowerCase().trim();
  const correctNp = currentQuestion.meaning_np ? currentQuestion.meaning_np.trim() : "";

  if (ans === correctEn || (correctNp && ans === correctNp)) {
    document.getElementById("result").innerText = "✅ Correct";
  } else {
    document.getElementById("result").innerText = "❌ " + currentQuestion.meaning_en;
  }
};

// ===== CANVAS LOGIC (FIXED) =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(e) {
  drawing = true;
  const coords = getCoords(e);
  ctx.beginPath();
  ctx.moveTo(coords.x, coords.y);
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault(); 
  const coords = getCoords(e);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
}

// Desktop Listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);

// Mobile Listeners
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
