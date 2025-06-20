A simple Flask web application that allows users to record their voice, automatically transcribes the speech, translates it into another language, and plays the translated audio back — all using Google Cloud's Speech-to-Text, Translation, and Text-to-Speech APIs.
🚀 Features

    🎤 Record voice directly from browser

    📝 Speech recognition (via Google Cloud Speech-to-Text)

    🌍 Translation (via Google Cloud Translation API)

    🔊 Text-to-Speech synthesis (via Google Cloud Text-to-Speech)

    🎧 Playback of translated speech

📦 Requirements

    Python 3.7+

    Google Cloud account with:

        Speech-to-Text API enabled

        Translation API enabled

        Text-to-Speech API enabled

    A valid Google Cloud Service Account key JSON file

Python Packages:

pip install Flask google-cloud-speech google-cloud-translate google-cloud-texttospeech

🔧 Setup Instructions
1. Clone this repository or save the project files:

git clone https://github.com/your-username/live-voice-translator.git
cd live-voice-translator

2. Install dependencies:

pip install Flask google-cloud-speech google-cloud-translate google-cloud-texttospeech

3. Set up Google Cloud credentials:

Download your service account JSON file from the Google Cloud Console and do one of these:
Option 1: Set the environment variable in terminal:

export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-file.json"  # Mac/Linux

set GOOGLE_APPLICATION_CREDENTIALS=path\to\your\service-account-file.json      # Windows

Option 2: Set it in the Python script (app.py):
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"path\to\your\service-account-file.json"

4. Run the Flask app:

python app.py

