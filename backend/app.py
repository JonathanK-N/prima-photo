from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration pour production
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DATABASE'] = '/tmp/portfolio.db'
else:
    app.config['DATABASE'] = 'portfolio.db'

def get_db():
    return sqlite3.connect(app.config['DATABASE'])

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_data (
            id INTEGER PRIMARY KEY,
            section TEXT UNIQUE,
            data TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            category TEXT,
            image_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/api/data/<section>', methods=['GET'])
def get_data(section):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT data FROM portfolio_data WHERE section = ?', (section,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return jsonify(json.loads(result[0]))
    else:
        return jsonify({})

@app.route('/api/data/<section>', methods=['POST'])
def save_data(section):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO portfolio_data (section, data, updated_at)
        VALUES (?, ?, ?)
    ''', (section, json.dumps(data), datetime.now()))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/photos', methods=['GET'])
def get_photos():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, description, category, image_data FROM photos ORDER BY created_at DESC')
    photos = []
    for row in cursor.fetchall():
        photos.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'category': row[3],
            'image': row[4]
        })
    conn.close()
    return jsonify(photos)

@app.route('/api/photos', methods=['POST'])
def add_photo():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO photos (title, description, category, image_data)
        VALUES (?, ?, ?, ?)
    ''', (data['title'], data['description'], data['category'], data['image']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'API is running', 'message': 'Prima Photo Backend'})

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({'status': 'OK', 'api': 'Prima Photo API v1.0'})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)