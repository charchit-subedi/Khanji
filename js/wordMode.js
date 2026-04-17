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
            let newWord;
            do {
                newWord = filteredData[Math.floor(Math.random() * filteredData.length)];
            } while (wordBatch.includes(newWord));
            wordBatch.push(newWord);
            return newWord;
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
        return wordBatch[batchIndex];
    }
}

export function renderWordUI(currentQ) {
    const questionEl = document.getElementById("question");
    const meaningEl = document.getElementById("meaning-display");
    const inputArea = document.getElementById("test-input-area");
    const canvas = document.getElementById("canvas");

    if (!isTestingPhase) {
        questionEl.innerText = currentQ.kanji;
        meaningEl.innerHTML = `<b style="color:#4CAF50">${currentQ.reading}</b><br>${currentQ.meaning_en}`;
        inputArea.style.display = "none";
        canvas.style.display = "block";
    } else {
        questionEl.innerText = currentQ.reading; // Show Furigana
        meaningEl.innerText = "Type the English meaning:";
        inputArea.style.display = "block";
        canvas.style.display = "none";
        document.getElementById("answer-input").value = "";
    }
}

export function checkWordAnswer(currentQ, userInput) {
    const isCorrect = userInput.toLowerCase().trim() === currentQ.meaning_en.toLowerCase().trim();
    if (isCorrect) {
        batchIndex++;
        if (batchIndex >= 5) {
            isTestingPhase = false;
            wordBatch = [];
            batchIndex = 0;
        }
    }
    return { isCorrect, scoreDelta: isCorrect ? 10 : -5 };
}
