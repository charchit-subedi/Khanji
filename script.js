import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allData = [];
let filteredData = [];
let currentQuestion;
let currentMode;
let currentLevel;

// Audio Files
const correctSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
const wrongSound = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');

// START
window.startApp = async function () {
  currentMode = document.getElementById("mode").value;
  currentLevel = document.getElementById("level").value;

  document.getElementById("menu").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("modeTitle").innerText = currentMode.replace("_", " ").toUpperCase();

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

  // Update UI with Kanji and English Meaning
  document.getElementById("question").innerText = currentQuestion.kanji;
  document.getElementById("meaning-display").innerText = currentQuestion.meaning_en;
  
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none"; // Hide next button
  window.clearCanvas();
};

// CHECK KANJI
window.checkKanji = function () {
  // Since we aren't using an AI recognizer yet, we simulate the check.
  // In a real app, this would compare the canvas pixels or strokes.
  const isCorrect = true; // Temporary logic: always true for demo

  if (isCorrect) {
    document.getElementById("result").innerText = "✅ Excellent! Correct.";
    document.getElementById("result").style.color = "green";
    correctSound.play();
    document.getElementById("nextBtn").style.display = "block"; // Allow progress
  } else {
    document.getElementById("result").innerText = "❌ Not quite right. Try again!";
    document.getElementById("result").style.color = "red";
    wrongSound.play();
    document.getElementById("nextBtn").style.display = "none"; // Block progress
  }
};

// ===== CANVAS DRAW (SMOOTH) =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDraw(e) {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function moveDraw(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPos(e);
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#333";
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", moveDraw);
canvas.addEventListener("mouseup", stopDraw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", moveDraw);
canvas.addEventListener("touchend", stopDraw);

window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
