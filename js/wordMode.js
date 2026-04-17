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
        // --- STUDY PHASE ---
        if (wordBatch.length < 5) {
            // Fill the batch with 5 unique words
            let newWord;
            do {
                newWord = filteredData[Math.floor(Math.random() * filteredData.length)];
            } while (wordBatch.includes(newWord));
            wordBatch.push(newWord);
            return newWord;
        } else {
            // Move through the 5 words
            const word = wordBatch[batchIndex];
            batchIndex++;
            if (batchIndex >= 5) {
                isTestingPhase = true;
                batchIndex = 0;
            }
            return word;
        }
    } else {
        // --- TEST PHASE ---
        return wordBatch[batchIndex];
    }
}

export function renderWordUI(currentQ) {
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");
    const canvas = document.getElementById("canvas");

    if (!isTestingPhase) {
        // Study Phase: Show Kanji and Practice Drawing
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `
            <div style="color: #4CAF50; font-weight: bold; font-size: 1.2rem;">${currentQ.reading}</div>
            <div style="color: #666;">${currentQ.meaning_en}</div>
        `;
        inputArea.style.display = "none";
        canvas.style.display = "block";
    } else {
        // Test Phase: Show only Furigana (Reading) and ask for English
        questionEl.innerText = currentQ.reading;
        meaningEl.innerText = "Type the English meaning:";
        inputArea.style.display = "block";
        canvas.style.display = "none";
        document.getElementById("answer-input").value = "";
        document.getElementById("answer-input").focus();
    }
}

export function checkWordAnswer(currentQ, userInput) {
    const isCorrect = userInput.toLowerCase().trim() === currentQ.meaning_en.toLowerCase().trim();
    
    if (isCorrect) {
        batchIndex++;
        // If all 5 words are finished, reset for a new batch of 5
        if (batchIndex >= 5) {
            isTestingPhase = false;
            wordBatch = [];
            batchIndex = 0;
        }
    }
    
    return {
        isCorrect,
        scoreDelta: isCorrect ? 10 : -5,
        isFinished: batchIndex === 0 && !isTestingPhase
    };
}
