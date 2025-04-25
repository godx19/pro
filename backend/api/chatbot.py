from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
import os
from datetime import datetime
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)

# OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

# Database configuration
config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return mysql.connector.connect(**config)

def analyze_symptoms(symptoms):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical assistant. Analyze the following symptoms and provide a structured response. Include possible conditions, severity, advice, medications, and precautions."},
                {"role": "user", "content": symptoms}
            ],
            temperature=0.7,
            max_tokens=500
        )
        analysis = response.choices[0].message.content

        return {
            'type': 'analysis',
            'message': 'Based on your symptoms, here\'s what I found:',
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Error in symptom analysis: {str(e)}")
        return {
            'type': 'error',
            'message': 'Sorry, I encountered an error while analyzing your symptoms.',
            'timestamp': datetime.now().isoformat()
        }

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message']
        response = analyze_symptoms(user_message)

        # Log to database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chat_logs (user_message, bot_response, created_at)
                VALUES (%s, %s, %s)
            """, (user_message, json.dumps(response), datetime.now()))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Database error: {str(e)}")

        return jsonify(response)

    except Exception as e:
        print(f"Error in chatbot endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', '1') == '1', port=5000)