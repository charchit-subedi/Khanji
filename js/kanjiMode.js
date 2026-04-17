import { getInk, clearCanvas } from "./canvas.js";
import { recognizeHandwriting } from "./ocr.js";

export async function handleKanjiCheck(currentQ, mode) {
    const candidates = await recognizeHandwriting(getInk());
    const isCorrect = candidates.slice(0, 3).includes(currentQ.kanji);
    
    return {
        isCorrect,
        scoreDelta: isCorrect ? 10 : (mode === "kanji_test" ? -5 : 0)
    };
}

export function renderKanjiQuestion(currentQ, mode) {
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");

    if (mode === "kanji_test") {
        questionEl.innerText = "？";
        meaningEl.innerHTML = `
            <div style="font-size: 1.6rem; color: #4CAF50; font-weight: bold;">${currentQ.reading || ''}</div>
            <div style="font-size: 1.2rem; color: #555;">${currentQ.meaning_en}</div>`;
    } else {
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerText = currentQ.meaning_en;
    }
}
