import os
import logging
import re
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


def flesch_reading_ease(text: str) -> float:
    """
    Calculate Flesch Reading Ease score.
    Higher scores = easier to read.
    """
    words = text.split()
    num_words = len(words)
    num_sentences = max(1, text.count('.') + text.count('!') + text.count('?'))
    num_syllables = sum(count_syllables(word) for word in words)

    words_per_sentence = num_words / num_sentences
    syllables_per_word = num_syllables / num_words

    # Flesch Reading Ease formula
    score = 206.835 - (1.015 * words_per_sentence) - \
        (84.6 * syllables_per_word)
    return round(score, 2)


def count_syllables(word: str) -> int:
    """
    Naive syllable counter for English words.
    """
    word = word.lower()
    vowels = "aeiouy"
    count = 0
    prev_char_was_vowel = False

    for char in word:
        if char in vowels:
            if not prev_char_was_vowel:
                count += 1
            prev_char_was_vowel = True
        else:
            prev_char_was_vowel = False

    # Remove silent 'e'
    if word.endswith("e"):
        count = max(1, count - 1)

    return count or 1


def keyword_density(text: str, keywords: str) -> float:
    """
    Calculate keyword density percentage.
    """
    words = re.findall(r'\w+', text.lower())
    total_words = len(words)
    if total_words == 0:
        return 0.0

    keyword_list = [kw.strip().lower() for kw in keywords.split(',')]
    keyword_count = sum(words.count(kw) for kw in keyword_list if kw)

    return round((keyword_count / total_words) * 100, 2)


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

        # Calculate readability and keyword density
        readability_score = flesch_reading_ease(content)
        keyword_density_score = keyword_density(content, data['keywords'])

        logger.info("Prompt sent successfully")
        logger.info(f"Word count: {word_count}")
        logger.info(f"Readability score: {readability_score}")
        logger.info(f"Keyword density: {keyword_density_score}%")

        return jsonify({
            'content': content,
            'analysis': {
                'wordCount': word_count,
                'readability': readability_score,
                'keywordDensity': keyword_density_score
            }
        })
    except Exception as e:
        logger.exception("Error generating content")
        return jsonify({'error': str(e)}), 500
