// ===== IMPORT FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== YOUR FIREBASE CONFIG =====
// 👉 Replace with YOUR actual config from Firebase console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "XXXXXX"
};

// ===== INITIALIZE FIREBASE =====
const app = initializeApp(firebaseConfig);

// ===== FIRESTORE DATABASE =====
const db = getFirestore(app);

// ===== EXPORT =====
export { db };