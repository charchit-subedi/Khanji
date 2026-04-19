import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== DATA =====
const kanjiData = [
  // ===== 関 =====
  { kanji: "関係する", reading: "かんけいする", meaning_en: "to relate / connection", meaning_np: "सम्बन्ध हुनु", level: "N3" },
  { kanji: "関心", reading: "かんしん", meaning_en: "interest", meaning_np: "चासो", level: "N3" },
  { kanji: "玄関", reading: "げんかん", meaning_en: "entrance", meaning_np: "प्रवेशद्वार", level: "N3" },

  // ===== 係 =====
  { kanji: "関係する", reading: "かんけいする", meaning_en: "relation", meaning_np: "सम्बन्ध", level: "N3" },
  { kanji: "係", reading: "かかり", meaning_en: "person in charge", meaning_np: "जिम्मेवार व्यक्ति", level: "N3" },

  // ===== 礼 =====
  { kanji: "お礼する", reading: "おれいする", meaning_en: "to thank", meaning_np: "धन्यवाद दिनु", level: "N3" },
  { kanji: "失礼しました", reading: "しつれいしました", meaning_en: "excuse me / sorry (past)", meaning_np: "माफ गर्नुहोस्", level: "N3" },
  { kanji: "失礼します", reading: "しつれいします", meaning_en: "excuse me", meaning_np: "माफ गर्नुहोस्", level: "N3" },

  // ===== 助 =====
  { kanji: "助ける", reading: "たすける", meaning_en: "to help", meaning_np: "मद्दत गर्नु", level: "N3" },
  { kanji: "助かる", reading: "たすかる", meaning_en: "to be helped / saved", meaning_np: "बच्नु / सहयोग पाउनु", level: "N3" },
  { kanji: "救助する", reading: "きゅうじょする", meaning_en: "to rescue", meaning_np: "उद्धार गर्नु", level: "N3" },

  // ===== 許 =====
  { kanji: "許可する", reading: "きょかする", meaning_en: "to permit", meaning_np: "अनुमति दिनु", level: "N3" },
  { kanji: "免許証", reading: "めんきょしょう", meaning_en: "license", meaning_np: "लाइसेन्स", level: "N3" },
  { kanji: "許す", reading: "ゆるす", meaning_en: "to forgive", meaning_np: "माफ गर्नु", level: "N3" },

  // ===== 可 =====
  { kanji: "可能な", reading: "かのうな", meaning_en: "possible", meaning_np: "सम्भव", level: "N3" },
  { kanji: "許可する", reading: "きょかする", meaning_en: "permit", meaning_np: "अनुमति", level: "N3" }
];

// ===== UPLOAD FUNCTION =====
async function uploadData() {
  const existing = await getDocs(collection(db, "kanji"));

  if (!existing.empty) {
    alert("⚠️ Data already exists! Upload stopped.");
    return;
  }

  for (let item of kanjiData) {
    await addDoc(collection(db, "kanji"), item);
    console.log("Added:", item.kanji);
  }

  alert("✅ Upload Complete!");
}

// RUN
uploadData();
