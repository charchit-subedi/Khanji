let wordBatch = [];
let batchIndex = 0;
let isTestingPhase = false;

export function initWordMode() {
    wordBatch = [];
    batchIndex = 0;
    isTestingPhase = false;
}

export function getNextWord(filteredData) {
    if (!isTestingPhase) {
        if (wordBatch.length < 5) {
            const word = filteredData[Math.floor(Math.random() * filteredData.length)];
            wordBatch.push(word);
            return word;
        } else {
            const word = wordBatch[batchIndex];
            batchIndex++;
            if (batchIndex >= 5) {
                isTestingPhase = true;
                batchIndex = 0;
            }
            return word;
        }
    } else {
        const word = wordBatch[batchIndex];
        return word;
    }
}

export function renderWordUI(currentQ) {
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");
    const canvas = document.getElementById("canvas");

    if (!isTestingPhase) {
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `<div style="color: #4CAF50;">${currentQ.reading}</div><div>${currentQ.meaning_en}</div>`;
        inputArea.style.display = "none";
        canvas.style.display = "block";
    } else {
        questionEl.innerText = currentQ.reading; // Show Furigana
        meaningEl.innerText = "Enter English Meaning:";
        inputArea.style.display = "block";
        canvas.style.display = "none";
    }
}

export function checkWordAnswer(currentQ, userInput) {
    const isCorrect = userInput.toLowerCase().trim() === currentQ.meaning_en.toLowerCase().trim();
    if (isCorrect) {
        batchIndex++;
        if (batchIndex >= 5) {
            isTestingPhase = false;
            wordBatch = []; // Reset for next 5
            batchIndex = 0;
        }
    }
    return {
        isCorrect,
        scoreDelta: isCorrect ? 10 : -5,
        finishedBatch: batchIndex === 0 && !isTestingPhase
    };
}
