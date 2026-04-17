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

// --- AUTH ATTACHMENTS ---
window.loginWithGoogle = () => signInWithPopup(auth, googleProvider).catch(e => alert(e.message));
window.handleEmailSignup = () => {
    const e = document.getElementById("auth-email").value;
    const p = document.getElementById("auth-password").value;
    createUserWithEmailAndPassword(auth, e, p).catch(err => alert(err.message));
};
window.handleEmailLogin = () => {
    const e = document.getElementById("auth-email").value;
    const p = document.getElementById("auth-password").value;
    signInWithEmailAndPassword(auth, e, p).catch(err => alert(err.message));
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            score = 100;
            await setDoc(userRef, { name: user.displayName || user.email.split('@')[0], email: user.email, points: score, isAdmin: false });
        } else {
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
        snap.forEach(d => allData.push(d.data()));
        const btn = document.getElementById("startBtn");
        btn.disabled = false; btn.innerText = "Start Learning"; btn.style.background = "#4CAF50";
    } catch (err) { console.error(err); }
}

function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("user-info").innerText = `${currentUser.displayName || currentUser.email} | Points: ${score}`;
}

// --- CORE GAMEPLAY ---
window.startApp = () => {
    wordBatch = []; batchIndex = 0; isTestingPhase = false;
    document.getElementById("menu").style.display = "none";
    document.getElementById("app").style.display = "block";
    filteredData = allData.filter(x => x.level === document.getElementById("level").value);
    window.nextQuestion();
};

window.nextQuestion = () => {
    const mode = document.getElementById("mode").value;
    const canvas = document.getElementById("canvas");
    const inputArea = document.getElementById("test-input-area");
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
            document.getElementById("question").innerText = currentQ.kanji;
            document.getElementById("meaning-display").innerHTML = `<b>${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        } else {
            canvas.style.display = "none"; inputArea.style.display = "block";
            document.getElementById("checkBtn").style.display = "block";
            currentQ = wordBatch[batchIndex];
            document.getElementById("question").innerText = currentQ.reading;
            document.getElementById("meaning-display").innerText = "Type English meaning:";
            document.getElementById("answer-input").value = "";
        }
    } else if (mode === "word_test") {
        canvas.style.display = "none"; inputArea.style.display = "block";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        document.getElementById("question").innerText = currentQ.reading;
        document.getElementById("meaning-display").innerText = "Type meaning:";
        document.getElementById("answer-input").value = "";
    } else {
        canvas.style.display = "block"; inputArea.style.display = "none";
        currentQ = filteredData[Math.floor(Math.random() * filteredData.length)];
        document.getElementById("question").innerText = mode === "kanji_test" ? "？" : currentQ.kanji;
        document.getElementById("meaning-display").innerText = mode === "kanji_test" ? currentQ.reading : currentQ.meaning_en;
    }
};

// --- THE FEEDBACK FIX ---
function displayFeedback(msg, isCorrect) {
    const resEl = document.getElementById("result");
    resEl.innerText = msg;
    resEl.style.color = isCorrect ? "#2e7d32" : "#d32f2f";
    resEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.checkAction = async () => {
    const mode = document.getElementById("mode").value;
    const isTyping = document.getElementById("test-input-area").style.display === "block";
    let correct = false;

    displayFeedback("Checking...", true);

    if (isTyping) {
        const userVal = document.getElementById("answer-input").value.toLowerCase().trim();
        const correctVal = currentQ.meaning_en.toLowerCase().trim();
        correct = (userVal === correctVal);
        
        if (correct && mode === "word_practice") {
            batchIndex++;
            if (batchIndex >= 5) { isTestingPhase = false; wordBatch = []; batchIndex = 0; }
        }
    } else {
        const candidates = await recognizeHandwriting(getInk());
        correct = candidates.slice(0, 3).includes(currentQ.kanji);
    }

    if (correct) {
        score += 10;
        displayFeedback("✅ Correct! +10 Points", true);
        document.getElementById("nextBtn").style.display = "block";
    } else {
        if (score >= 5) score -= 5;
        displayFeedback("❌ Incorrect. Try again!", false);
    }

    updateUI();
    updateDoc(doc(db, "users", currentUser.uid), { points: score });
};

window.showAdminLogin = () => document.getElementById("admin-modal").style.display = "block";
window.verifyAdmin = async () => {
    if (document.getElementById("admin-pass").value === "admin123") {
        await updateDoc(doc(db, "users", currentUser.uid), { isAdmin: true });
        alert("Admin Active"); document.getElementById("admin-modal").style.display = "none";
    }
};
window.goBack = () => { document.getElementById("menu").style.display = "block"; document.getElementById("app").style.display = "none"; };
window.clearCanvas = clearCanvas;
