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

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isRecording = false;
let typingTimer;  // Timer identifier
let doneTypingInterval = 1000;  // Time in ms (1 second)

recordBtn.addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
    } else {
        const inputLanguage = inputLanguageSelect.value;
        recognition.lang = inputLanguage === 'auto' ? 'en' : inputLanguage; // Default to English (United States) if 'auto' is selected

        recognition.start();
    }
    isRecording = !isRecording;
    if (isRecording){
        recordBtn.classList.add("is-recording");
    }else{
        recordBtn.classList.remove("is-recording");
    }
});

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    manualInputEl.value = transcript;
    
    const inputLanguage = inputLanguageSelect.value; 
    const targetLanguage = languageSelect.value;
    
    const data = await translateText(transcript, inputLanguage, targetLanguage);
    updateTranslationOutput(data);
};

recognition.onspeechend = () => {
    isRecording = false;
    recordBtn.classList.remove("is-recording")
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isRecording = false;
    recordBtn.classList.remove("is-recording")
};

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
    //translationEl.value = 'Translating...';
    const data = await translateText(text, inputLanguage, targetLanguage);
    updateTranslationOutput(data);
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

function updateTranslationOutput(data) {
    translationEl.value = `${data.translated_text}`;

    copyBtn.disabled = !data.translated_text;
    copyBtn.style.color='#6683b7';
    copyBtn.style.cursor='pointer';
    
    // Clear previous audio source
    translatedAudio.pause();
    translatedAudio.src = '';
    translatedAudio.load();

    // Set new audio source with a unique query parameter to prevent caching
    translatedAudio.src = `/translated_audio/${data.audio_file}?t=${new Date().getTime()}`;
    translatedAudio.play();
}

//clear output after input is cleared
function clearTranslationOutput() {
    translationEl.value = ' ';

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

    //translationEl.value = 'Translating...';
    const data = await translateText(text, inputLanguage, targetLanguage);
    updateTranslationOutput(data);
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