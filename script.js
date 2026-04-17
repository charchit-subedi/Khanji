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
  const i = Math.floor(Math.random() * filteredData.length);
  currentQuestion = filteredData[i];

  document.getElementById("question").innerText = currentQuestion.kanji;
  document.getElementById("answer").value = "";
  document.getElementById("result").innerText = "";
};

// CHECK
window.checkAnswer = function () {
  const ans = document.getElementById("answer").value.toLowerCase();

  if (ans === currentQuestion.meaning_en.toLowerCase() ||
      ans === currentQuestion.meaning_np) {
    document.getElementById("result").innerText = "✅ Correct";
  } else {
    document.getElementById("result").innerText =
      "❌ " + currentQuestion.meaning_en;
  }
};

// ===== CANVAS DRAW (FIXED FOR MOBILE) =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;

// Mouse
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("mousemove", draw);

// Touch
canvas.addEventListener("touchstart", () => drawing = true);
canvas.addEventListener("touchend", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("touchmove", function(e) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  drawTouch(x, y);
});

function draw(e) {
  if (!drawing) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function drawTouch(x, y) {
  if (!drawing) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
}

// CLEAR
window.clearCanvas = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
