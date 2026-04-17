import { db } from "./firebase.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged,
    createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, getDoc, setDoc, updateDoc, collection, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let score = 0;
let allData = [], filteredData = [], currentQ;
let wordBatch = [], batchIndex = 0, isTestingPhase = false;

initCanvas();

// --- AUTHENTICATION FUNCTIONS ---

window.loginWithGoogle = () => {
    signInWithPopup(auth, googleProvider).catch(err => alert("Google Error: " + err.message));
};

window.handleEmailSignup = () => {
    const email = document.getElementById("auth-email").value;
    const pass = document.getElementById("auth-password").value;
    createUserWithEmailAndPassword(auth, email, pass)
        .catch(err => alert("Signup Error: " + err.message));
};

window.handleEmailLogin = () => {
    const email = document.getElementById("auth-email").value;
    const pass = document.getElementById("auth-password").value;
    signInWithEmailAndPassword(auth, email, pass)
        .catch(err => alert("Login Error: " + err.message));
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            score = 100; // Gift for new user
            await setDoc(userRef, {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                points: score,
                isAdmin: false
            });
        } else {
            score = userSnap.data().points || 0;
        }

        document.getElementById("auth-overlay").style.display = "none";
        updatePointsUI();
        preLoadData();
    }
});

// --- CORE APP LOGIC ---

async function preLoadData() {
    const snap = await getDocs(collection(db, "kanji"));
    allData = [];
    snap.forEach(doc => allData.push(doc.data()));
    const btn = document.getElementById("startBtn");
    btn.disabled = false;
    btn.innerText = "Start Learning";
    btn.style.background = "#4CAF50";
}

function updatePointsUI() {
    const name = currentUser.displayName || currentUser.email;
    document.getElementById("score").innerText = score;
    document.getElementById("user-info").innerText = `${name} | Points: ${score}`;
}

async function saveScore() {
    if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), { points: score });
    }
}

window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    wordBatch = []; batchIndex = 0; isTestingPhase = false;
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("modeTitle").innerText = mode.toUpperCase();
    filteredData = allData.filter(x => x.level === level);
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    const canvas = document.getElementById("canvas");
    const inputArea = document.getElementById("test-input-area");
    const qBox = document.getElementById("question");
    const mBox = document.getElementById("meaning-display");

    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode === "word_practice") {
        if (!isTestingPhase) {
            canvas.style.display = "none"; inputArea.style.display = "none";
            document.getElementById("checkBtn").style.display = "none";
            document.getElementById("nextBtn").style.display = "block";
            if (wordBatch.length < 5) {
                currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
                wordBatch.push(currentQ);
            } else {
                currentQ = wordBatch[batchIndex++];
                if (batchIndex >= 5) { isTestingPhase = true; batchIndex = 0; }
            }
            qBox.innerText = currentQ.kanji;
            mBox.innerHTML = `<b>${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            canvas.style.display = "none"; inputArea.style.display = "block";
            document.getElementById("checkBtn").style.display = "block";
            currentQ = wordBatch[batchIndex];
            qBox.innerText = currentQ.reading;
            mBox.innerText = "Type English meaning:";
            document.getElementById("answer-input").value = "";
        }
    } else if (mode === "word_test") {
        canvas.style.display = "none"; inputArea.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        qBox.innerText = currentQ.reading;
        mBox.innerText = "Type meaning:";
        document.getElementById("answer-input").value = "";
    } else {
        canvas.style.display = "block"; inputArea.style.display = "none";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        qBox.innerText = mode === "kanji_test" ? "？" : currentQ.kanji;
        mBox.innerText = mode === "kanji_test" ? currentQ.reading : currentQ.meaning_en;
    }
};

window.checkAction = async () => {
    const isTyping = document.getElementById("test-input-area").style.display === "block";
    let correct = false;
    if (isTyping) {
        correct = (document.getElementById("answer-input").value.toLowerCase().trim() === currentQ.meaning_en.toLowerCase().trim());
        if (correct && document.getElementById("mode").value === "word_practice") {
            batchIndex++;
            if (batchIndex >= 5) { isTestingPhase = false; wordBatch = []; batchIndex = 0; }
        }
    } else {
        const ink = await recognizeHandwriting(getInk());
        correct = ink.slice(0, 3).includes(currentQ.kanji);
    }

    if (correct) { score += 10; document.getElementById("nextBtn").style.display = "block"; } 
    else { if (score >= 5) score -= 5; }
    updatePointsUI();
    saveScore();
};

window.goBack = () => { document.getElementById("menu").style.display = "block"; document.getElementById("app").style.display = "none"; };
window.clearCanvas = clearCanvas;
