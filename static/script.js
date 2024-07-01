const recordBtn = document.getElementById('record-btn');
const translateBtn = document.getElementById('translate-btn');
const inputLanguageSelect = document.getElementById('input-language-select');
const languageSelect = document.getElementById('language-select');
const translationEl = document.getElementById('translation');
const translatedAudio = document.getElementById('translated-audio');
const manualInputEl = document.getElementById('manual-input');
const switchBtn = document.getElementById('switch-btn');
const copyBtn = document.getElementById('copy-btn');
const notification = document.getElementById('notification');

// Initialize SpeechRecognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true; // Keep listening until explicitly stopped
recognition.interimResults = true;
recognition.maxAlternatives = 1;

let isRecording = false;
let typingTimer;  // Timer identifier
let doneTypingInterval = 1000;  // Time in ms (1 second)

// Function to start or stop recording
recordBtn.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
    } else {
        // set recognition.lang based on inputLanguageSelect value
        const inputLanguage = inputLanguageSelect.value;
        recognition.lang = inputLanguage === 'auto' ? 'en-US' : inputLanguage; // Default to English (United States) if 'auto' is selected

        recognition.start();
    }
    isRecording = !isRecording;
    if (isRecording){
        recordBtn.classList.add("is-recording");
    }else{
        recordBtn.classList.remove("is-recording");
    }
});

// Speech recognition result handler
recognition.onresult = async (event) => {

    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
    }
    manualInputEl.value = transcript; // Update the manual input with the interim result

    if (!event.results[event.resultIndex].isFinal) {
        // If the result is not final, translate the interim result
        const inputLanguage = inputLanguageSelect.value; // This could be 'auto' or a specific language code
        const targetLanguage = languageSelect.value;

        const data = await translateText(transcript, inputLanguage, targetLanguage);
        updateTranslationOutput(data, true); // Pass true to indicate interim translation
    } else {
        // If the result is final, translate the final result
        const inputLanguage = inputLanguageSelect.value; // This could be 'auto' or a specific language code
        const targetLanguage = languageSelect.value;

        const data = await translateText(transcript, inputLanguage, targetLanguage);
        updateTranslationOutput(data, false); // Pass false to indicate final translation
    }
};


// handle end of speech recognition
recognition.onend = () => {
    if (isRecording) {
        recognition.start();
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isRecording = false;
    recordBtn.classList.remove("is-recording")
};
 
//function to switch input and output languages
switchBtn.addEventListener('click', () => {
    const temp = inputLanguageSelect.value;
    inputLanguageSelect.value = languageSelect.value;
    languageSelect.value = temp;

     // Switch the content of input and output textareas
     const tempText = manualInputEl.value;
     manualInputEl.value = translationEl.value.replace('Translation: ', '');
     translationEl.value = tempText ? `${tempText}` : '';
     
     // Clear the audio source if there was any
     translatedAudio.pause();
     translatedAudio.src = '';
     translatedAudio.load();
});

manualInputEl.addEventListener('input', async () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
    const text = manualInputEl.value;
    const inputLanguage = inputLanguageSelect.value;
    const targetLanguage = languageSelect.value;

    //Display translating... text while translating
    const data = await translateText(text, inputLanguage, targetLanguage);
    updateTranslationOutput(data, false);
    }, doneTypingInterval);
});

// Handle language selection change for output language
languageSelect.addEventListener('change', () => {
    translateManualInput();
});

manualInputEl.addEventListener('input', () => {
    if (manualInputEl.value.trim() === '') {
        clearTranslationOutput();
    }
});

async function translateText(text, inputLanguage, targetLanguage) {
    const response = await fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            input_language: inputLanguage,
            target_language: targetLanguage
        })
    });

    return await response.json();
}

function updateTranslationOutput(data, isInterim) {
    //translationEl.value = `${data.translated_text}`;
    
    if (isInterim) {
        translationEl.value = `${data.translated_text}`;
    } else {
        translationEl.value = `${data.translated_text}`;
    }

    // Enable or disable the copy button based on the translation output
    copyBtn.disabled = !data.translated_text;

    // Clear previous audio source
    if (!isInterim) {
    translatedAudio.pause();
    translatedAudio.src = '';
    translatedAudio.load();

    // Set new audio source with a unique query parameter to prevent caching
    translatedAudio.src = `/translated_audio/${data.audio_file}?t=${new Date().getTime()}`;
    translatedAudio.play();
    }
}

//clear output after input is cleared
function clearTranslationOutput() {
    translationEl.value = '';

    // Disable the copy button
    copyBtn.disabled = true;
    
    // Clear previous audio source
    translatedAudio.pause();
    translatedAudio.src = '';
    translatedAudio.load();
}

// Function to translate manual input
async function translateManualInput() {
    const text = manualInputEl.value;
    const inputLanguage = inputLanguageSelect.value;
    const targetLanguage = languageSelect.value;

    const data = await translateText(text, inputLanguage, targetLanguage);
    updateTranslationOutput(data, false);
}

// Copy translation to clipboard
copyBtn.addEventListener('click', () => {
    const translationText = translationEl.value;
    navigator.clipboard.writeText(translationText).then(() => {
        showNotification();
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
});

// Function to show notification
function showNotification() {
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000); // Show notification for 2 seconds
}

