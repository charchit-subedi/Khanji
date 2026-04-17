export async function recognizeHandwriting(ink) {
    if (ink.length === 0) return [];
    const url = 'https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
    
    const body = {
        options: 'enable_pre_space',
        requests: [{
            writing_guide: { width: 300, height: 400 },
            ink: ink,
            language: 'ja'
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return data[1][0][1]; // Returns array of possible Kanji
    } catch (e) {
        console.error("OCR Error:", e);
        return [];
    }
}
