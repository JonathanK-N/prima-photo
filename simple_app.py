from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Fichiers de données
DATA_DIR = '/tmp' if os.environ.get('FLASK_ENV') == 'production' else '.'
DATA_FILE = os.path.join(DATA_DIR, 'portfolio_data.json')
PHOTOS_FILE = os.path.join(DATA_DIR, 'photos.json')

def load_data():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f)

def load_photos():
    try:
        with open(PHOTOS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_photos(photos):
    with open(PHOTOS_FILE, 'w') as f:
        json.dump(photos, f)

@app.route('/')
def index():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return jsonify({'status': 'API is running', 'message': 'Prima Photo Backend'})

@app.route('/admin')
def admin():
    try:
        with open('admin.html', 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return 'Admin page not found'

@app.route('/<path:filename>')
def static_files(filename):
    try:
        return send_from_directory('.', filename)
    except:
        return 'File not found', 404

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({'status': 'OK', 'api': 'Prima Photo API v1.0'})

@app.route('/api/data/<section>', methods=['GET'])
def get_data(section):
    data = load_data()
    return jsonify(data.get(section, {}))

@app.route('/api/data/<section>', methods=['POST'])
def save_section_data(section):
    data = load_data()
    data[section] = request.json
    save_data(data)
    return jsonify({'success': True})

@app.route('/api/photos', methods=['GET'])
def get_photos():
    return jsonify(load_photos())

@app.route('/api/photos', methods=['POST'])
def add_photo():
    photos = load_photos()
    photo_data = request.json
    photo_data['id'] = len(photos) + 1
    photo_data['created_at'] = datetime.now().isoformat()
    photos.append(photo_data)
    save_photos(photos)
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)