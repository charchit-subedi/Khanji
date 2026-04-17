// Local variables for this mode
let wordBatch = [];
let batchIndex = 0;
let isTestingPhase = false;

export function initWordMode() {
    wordBatch = [];
    batchIndex = 0;
    isTestingPhase = false;
}

// Logic to decide which word comes next
export function getNextWord(filteredData) {
    if (!isTestingPhase) {
        // Phase 1: Teaching (First 5 words)
        if (wordBatch.length < 5) {
            const newWord = filteredData[Math.floor(Math.random() * filteredData.length)];
            wordBatch.push(newWord);
            return newWord;
        } else {
            // After 5 words are picked, we show them once
            const word = wordBatch[batchIndex];
            batchIndex++;
            if (batchIndex >= 5) {
                isTestingPhase = true; // Switch to Test after 5th word
                batchIndex = 0;
            }
            return word;
        }
    } else {
        // Phase 2: Testing (Ask the same 5 words)
        return wordBatch[batchIndex];
    }
}

// Update the UI based on whether we are Learning or Testing
export function renderWordUI(currentQ) {
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");
    const canvas = document.getElementById("canvas");

    if (!isTestingPhase) {
        // Learning: Show Kanji, Reading, and Meaning
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `
            <div style="color: #4CAF50; font-weight: bold;">${currentQ.reading}</div>
            <div>${currentQ.meaning_en}</div>
        `;
        inputArea.style.display = "none";
        canvas.style.display = "block";
    } else {
        // Testing: Show only reading (Furigana), hide Kanji/Meaning
        questionEl.innerText = currentQ.reading;
        meaningEl.innerText = "What is the English meaning?";
        inputArea.style.display = "block";
        canvas.style.display = "none"; // Hide canvas since we are typing
    }
}

// Check the typed answer
export function checkWordAnswer(currentQ, userInput) {
    const isCorrect = userInput.toLowerCase().trim() === currentQ.meaning_en.toLowerCase().trim();
    
    if (isCorrect) {
        batchIndex++;
        // If we finished testing all 5 words, reset the cycle
        if (batchIndex >= 5) {
            isTestingPhase = false;
            wordBatch = []; 
            batchIndex = 0;
        }
    }
    
    return {
        isCorrect,
        scoreDelta: isCorrect ? 10 : -5
    };
}
