from flask import Flask, request, jsonify, send_from_directory
from googletrans import Translator
from gtts import gTTS
import os

app = Flask(__name__)
translator = Translator()

# Directory for storing audio files
AUDIO_DIR = 'translated_audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Language codes
LANGUAGE_CODES = {
    'English': 'en',
    'Chinese': 'zh-CN',
    'Malay': 'ms',
}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    input_language = data.get('input_language')
    target_language = data.get('target_language')

    # Detect language if input language is not specified
    if input_language == 'auto':
        detected_lang = translator.detect(text).lang
    else:
        detected_lang = input_language

    # Translate text
    translation = translator.translate(text, src=detected_lang, dest=target_language)
    translated_text = translation.text

    # Convert translated text to speech
    tts = gTTS(text=translated_text, lang=target_language)
    audio_filename = f'translated_{target_language}.mp3'
    audio_path = os.path.join(AUDIO_DIR, audio_filename)
    tts.save(audio_path)

    return jsonify({
        'detected_language': detected_lang,
        'translated_text': translated_text,
        'audio_file': audio_filename
    })

@app.route('/translated_audio/<filename>')
def get_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)