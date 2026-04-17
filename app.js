import { db } from "./firebase.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, getDoc, setDoc, updateDoc, collection, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initCanvas, getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();

let currentUser = null;
let allData = [], filteredData = [], currentQ, score = 0;
let wordBatch = [], batchIndex = 0, isTestingPhase = false;

initCanvas();

// --- AUTHENTICATION & INITIALIZATION ---
window.login = () => {
    signInWithPopup(auth, provider).catch(err => alert("Login failed: " + err.message));
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // NEW USER: Give 100 points
            score = 100;
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                points: score,
                isAdmin: false
            });
        } else {
            // EXISTING USER: Load points
            score = userSnap.data().points || 0;
        }

        document.getElementById("auth-overlay").style.display = "none";
        updateUI();
        preLoadData();
    }
});

async function preLoadData() {
    try {
        const snap = await getDocs(collection(db, "kanji"));
        allData = [];
        snap.forEach(doc => allData.push(doc.data()));
        const btn = document.getElementById("startBtn");
        btn.disabled = false;
        btn.innerText = "Start Learning";
        btn.style.background = "#4CAF50";
    } catch (e) { console.error("Firebase Error:", e); }
}

function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("user-info").innerText = `User: ${currentUser.displayName} | Points: ${score}`;
}

async function savePoints() {
    if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { points: score });
    }
}

// --- APP NAVIGATION ---
window.startApp = () => {
    const mode = document.getElementById("mode").value;
    const level = document.getElementById("level").value;
    
    wordBatch = []; batchIndex = 0; isTestingPhase = false;
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
    const qBox = document.getElementById("question");
    const mBox = document.getElementById("meaning-display");

    clearCanvas();
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (mode === "word_practice") {
        if (!isTestingPhase) {
            // TEACHING PHASE
            canvas.style.display = "none";
            inputArea.style.display = "none";
            checkBtn.style.display = "none";
            document.getElementById("nextBtn").style.display = "block";

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
            // TESTING PHASE (Typing)
            canvas.style.display = "none";
            inputArea.style.display = "block";
            checkBtn.style.display = "block";
            currentQ = wordBatch[batchIndex];
            qBox.innerText = currentQ.reading;
            mBox.innerText = "What is the English meaning?";
            document.getElementById("answer-input").value = "";
        }
    } else if (mode === "word_test") {
        canvas.style.display = "none";
        inputArea.style.display = "block";
        checkBtn.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        qBox.innerText = currentQ.reading;
        mBox.innerText = "Type the English meaning";
        document.getElementById("answer-input").value = "";
    } else {
        // KANJI DRAWING
        canvas.style.display = "block";
        inputArea.style.display = "none";
        checkBtn.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        if (mode === "kanji_test") {
            qBox.innerText = "？";
            mBox.innerHTML = `<b style="color:green; font-size:1.3rem;">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            qBox.innerText = currentQ.kanji;
            mBox.innerText = currentQ.meaning_en;
        }
    }
};

window.checkAction = async () => {
    const isTyping = document.getElementById("test-input-area").style.display === "block";
    let isCorrect = false;

    if (isTyping) {
        const val = document.getElementById("answer-input").value.toLowerCase().trim();
        isCorrect = (val === currentQ.meaning_en.toLowerCase().trim());
        if (isCorrect && document.getElementById("mode").value === "word_practice") {
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
        if (score >= 5) score -= 5;
    }
    updateUI();
    savePoints();
};

// --- ADMIN SYSTEM ---
window.showAdminLogin = () => { document.getElementById("admin-modal").style.display = "block"; };
window.verifyAdmin = async () => {
    const pass = document.getElementById("admin-pass").value;
    if (pass === "admin123") { // REPLACE THIS
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { isAdmin: true });
        alert("Admin Permissions Active.");
        document.getElementById("admin-modal").style.display = "none";
    } else { alert("Wrong Password"); }
};

window.goBack = () => {
    document.getElementById("menu").style.display = "block";
    document.getElementById("app").style.display = "none";
};
window.clearCanvas = clearCanvas;
