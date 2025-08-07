import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/generate', methods=['POST'])
def generate_content():
    data = request.json
    
    prompt = f"""Create a {data['contentType']} about {data['topic']}.
    Tone: {data['tone']}
    Target audience: {data['audience']}
    Keywords to include: {data['keywords']}
    
    Make it engaging and professional."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        print(f"Prompt sent: {prompt}")
        print(f"Response received: {response}")
        
        content = response.choices[0].message.content
        word_count = len(content.split())
        print(f"Generated content: {content}")
        
        return jsonify({
            'content': content,
            'analysis': {
                'wordCount': word_count,
                'readability': 75,  # Mock score
                'keywordDensity': 2   # Mock percentage
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
