from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import json
import os
import base64
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'prima-photo-secret-key-2024'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Fichiers de données
DATA_DIR = '/tmp' if os.environ.get('RAILWAY_ENVIRONMENT') else '.'
PHOTOS_FILE = os.path.join(DATA_DIR, 'photos.json')
CONTENT_FILE = os.path.join(DATA_DIR, 'content.json')

def load_photos():
    try:
        with open(PHOTOS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_photos(photos):
    with open(PHOTOS_FILE, 'w') as f:
        json.dump(photos, f)

def load_content():
    try:
        with open(CONTENT_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_content(content):
    with open(CONTENT_FILE, 'w') as f:
        json.dump(content, f)

@app.route('/')
def index():
    photos = load_photos()
    content = load_content()
    return render_template('index_pro.html', photos=photos, content=content)

@app.route('/admin')
def admin_login():
    if 'admin_logged_in' in session:
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html')

@app.route('/admin/login', methods=['POST'])
def admin_login_post():
    username = request.form['username']
    password = request.form['password']
    
    if username == 'admin' and password == 'prima2024':
        session['admin_logged_in'] = True
        return redirect(url_for('admin_dashboard'))
    
    flash('Identifiants incorrects')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    
    photos = load_photos()
    return render_template('admin_pro.html', photos=photos)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('index'))

@app.route('/admin/add_photo', methods=['POST'])
def add_photo():
    if 'admin_logged_in' not in session:
        return jsonify({'success': False, 'message': 'Non autorisé'})
    
    photos = load_photos()
    
    title = request.form['title']
    description = request.form['description']
    category = request.form['category']
    
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            image_data = base64.b64encode(file.read()).decode('utf-8')
            image_data = f"data:image/jpeg;base64,{image_data}"
        else:
            return jsonify({'success': False, 'message': 'Aucune image'})
    else:
        return jsonify({'success': False, 'message': 'Aucune image'})
    
    photo = {
        'id': len(photos) + 1,
        'title': title,
        'description': description,
        'category': category,
        'image_data': image_data,
        'created_at': datetime.now().isoformat()
    }
    
    photos.append(photo)
    save_photos(photos)
    
    return jsonify({'success': True, 'message': 'Photo ajoutée'})

@app.route('/admin/delete_photo/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    if 'admin_logged_in' not in session:
        return jsonify({'success': False})
    
    photos = load_photos()
    photos = [p for p in photos if p['id'] != photo_id]
    save_photos(photos)
    
    return jsonify({'success': True})

@app.route('/admin/save_content', methods=['POST'])
def save_content_route():
    if 'admin_logged_in' not in session:
        return jsonify({'success': False})
    
    try:
        content = load_content()
        section = request.form['section']
        data = json.loads(request.form['data'])
        
        content[section] = data
        save_content(content)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)