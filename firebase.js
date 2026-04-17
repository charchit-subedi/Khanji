import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTYa000tqEDgGt9W0LCxm2_A2fWS1Ph7Y",
  authDomain: "khanji-e7b25.firebaseapp.com",
  projectId: "khanji-e7b25",
  storageBucket: "khanji-e7b25.firebasestorage.app",
  messagingSenderId: "18693432968",
  appId: "1:18693432968:web:1e06923669eaf68777213d",
  measurementId: "G-H87CWX8Y9L"// Your existing config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

