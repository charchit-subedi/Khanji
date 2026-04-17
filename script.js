import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allData = [];
let filteredData = [];
let currentQuestion;
let currentMode;
let currentLevel;

// Track strokes for OCR: Format is [[x,x,x], [y,y,y], [t,t,t]] per stroke
let ink = []; 
let currentStrokeX = [];
let currentStrokeY = [];
let currentStrokeT = [];

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

window.goBack = function () {
  document.getElementById("menu").style.display = "block";
  document.getElementById("app").style.display = "none";
};

async function loadData() {
  allData = [];
  const snapshot = await getDocs(collection(db, "kanji"));
  snapshot.forEach(doc => allData.push(doc.data()));
}

function filterData() {
  filteredData = allData.filter(x => x.level === currentLevel);
}

// NEXT
window.nextQuestion = function () {
  if (filteredData.length === 0) return;

  const i = Math.floor(Math.random() * filteredData.length);
  currentQuestion = filteredData[i];

  document.getElementById("question").innerText = currentQuestion.kanji;
  document.getElementById("meaning-display").innerText = currentQuestion.meaning_en;
  
  document.getElementById("result").innerText = "";
  document.getElementById("nextBtn").style.display = "none"; 
  window.clearCanvas();
};

// OCR API CALL
async function recognizeHandwriting() {
  if (ink.length === 0) return [];

  const url = 'https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
  const requestBody = {
    options: 'enable_pre_space',
    requests: [{
      writing_guide: { width: canvas.width, height: canvas.height },
      ink: ink,
      language: 'ja'
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data[1][0][1]; // Array of recognized characters
  } catch (e) {
    console.error("OCR Error:", e);
    return [];
  }
}

// CHECK KANJI
window.checkKanji = async function () {
  const resultEl = document.getElementById("result");
  resultEl.innerText = "Checking...";
  resultEl.style.color = "gray";

  const candidates = await recognizeHandwriting();
  
  // Check if the target kanji is in the top 3 results from Google
  if (candidates.slice(0, 3).includes(currentQuestion.kanji)) {
    resultEl.innerText = "✅ Correct Kanji!";
    resultEl.style.color = "green";
    correctSound.play();
    document.getElementById("nextBtn").style.display = "block";
  } else {
    resultEl.innerText = "❌ Not recognized. Try again!";
    resultEl.style.color = "red";
    wrongSound.play();
    document.getElementById("nextBtn").style.display = "none";
  }
};

// ===== CANVAS DRAW (WITH STROKE TRACKING) =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDraw(e) {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  
  // Start new stroke data
  currentStrokeX = [pos.x];
  currentStrokeY = [pos.y];
  currentStrokeT = [Date.now()];
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

  // Collect data points
  currentStrokeX.push(pos.x);
  currentStrokeY.push(pos.y);
  currentStrokeT.push(Date.now());
}

function stopDraw() {
  if (!drawing) return;
  drawing = false;
  // Push the completed stroke to the ink array
  ink.push([currentStrokeX, currentStrokeY, currentStrokeT]);
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", moveDraw);
canvas.addEventListener("mouseup", stopDraw);

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", moveDraw);
canvas.addEventListener("touchend", stopDraw);

window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ink = []; // Reset OCR data
};
