import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== YOUR DATA =====
const kanjiData = [
  { kanji: "食べる", reading: "たべる", meaning_en: "eat", meaning_np: "खानु", level: "N5" },
  { kanji: "行く", reading: "いく", meaning_en: "go", meaning_np: "जानु", level: "N5" },
  { kanji: "来る", reading: "くる", meaning_en: "come", meaning_np: "आउनु", level: "N5" },
  { kanji: "見る", reading: "みる", meaning_en: "see", meaning_np: "हेर्नु", level: "N5" },
  { kanji: "聞く", reading: "きく", meaning_en: "listen", meaning_np: "सुन्नु", level: "N5" },
  { kanji: "飲む", reading: "のむ", meaning_en: "drink", meaning_np: "पिउनु", level: "N5" },
  { kanji: "読む", reading: "よむ", meaning_en: "read", meaning_np: "पढ्नु", level: "N5" },
  { kanji: "書く", reading: "かく", meaning_en: "write", meaning_np: "लेख्नु", level: "N5" },
  { kanji: "話す", reading: "はなす", meaning_en: "speak", meaning_np: "बोल्नु", level: "N5" },
  { kanji: "買う", reading: "かう", meaning_en: "buy", meaning_np: "किन्नु", level: "N5" },

  { kanji: "使う", reading: "つかう", meaning_en: "use", meaning_np: "प्रयोग गर्नु", level: "N4" },
  { kanji: "作る", reading: "つくる", meaning_en: "make", meaning_np: "बनाउनु", level: "N4" },
  { kanji: "開ける", reading: "あける", meaning_en: "open", meaning_np: "खोल्नु", level: "N4" },
  { kanji: "閉める", reading: "しめる", meaning_en: "close", meaning_np: "बन्द गर्नु", level: "N4" },
  { kanji: "始める", reading: "はじめる", meaning_en: "start", meaning_np: "सुरु गर्नु", level: "N4" },
  { kanji: "終わる", reading: "おわる", meaning_en: "finish", meaning_np: "समाप्त हुनु", level: "N4" },
  { kanji: "働く", reading: "はたらく", meaning_en: "work", meaning_np: "काम गर्नु", level: "N4" },
  { kanji: "休む", reading: "やすむ", meaning_en: "rest", meaning_np: "आराम गर्नु", level: "N4" },

  { kanji: "増える", reading: "ふえる", meaning_en: "increase", meaning_np: "बढ्नु", level: "N3" },
  { kanji: "減る", reading: "へる", meaning_en: "decrease", meaning_np: "घट्नु", level: "N3" },
  { kanji: "続ける", reading: "つづける", meaning_en: "continue", meaning_np: "जारी राख्नु", level: "N3" },
  { kanji: "決める", reading: "きめる", meaning_en: "decide", meaning_np: "निर्णय गर्नु", level: "N3" },
  { kanji: "比べる", reading: "くらべる", meaning_en: "compare", meaning_np: "तुलना गर्नु", level: "N3" }
];

// ===== UPLOAD FUNCTION =====
async function uploadData() {
  for (let item of kanjiData) {
    await addDoc(collection(db, "kanji"), item);
    console.log("Added:", item.kanji);
  }
  alert("Upload Complete ✅");
}

// ===== RUN FUNCTION =====
uploadData();