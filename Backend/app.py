import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
CORS(app)

# OpenAI client setup
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
# Default model if not set
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

@app.route('/generate', methods=['POST'])
def generate_content():
    data = request.json

    # Validate input
    required_fields = ['contentType', 'topic', 'tone', 'audience', 'keywords']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f"Missing fields: {', '.join(missing_fields)}"}), 400

    # Create prompt
    prompt = (
        f"Create a {data['contentType']} about {data['topic']}.\n"
        f"Tone: {data['tone']}\n"
        f"Target audience: {data['audience']}\n"
        f"Keywords to include: {data['keywords']}\n\n"
        "Make it engaging and professional."
    )

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )

        content = response.choices[0].message.content.strip()
        word_count = len(content.split())

        logger.info("Prompt sent successfully")
        logger.info(f"Word count: {word_count}")

        return jsonify({
            'content': content,
            'analysis': {
                'wordCount': word_count,
                'readability': 75,   # TODO: Replace with real analysis
                'keywordDensity': 2  # TODO: Replace with real analysis
            }
        })
    except Exception as e:
        logger.exception("Error generating content")
        return jsonify({'error': str(e)}), 500

