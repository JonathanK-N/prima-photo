from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import base64
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'prima-photo-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modèles de base de données
class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    image_data = db.Column(db.Text, nullable=False)  # Base64
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Content(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(50), unique=True, nullable=False)
    data = db.Column(db.Text, nullable=False)  # JSON
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

# Routes principales
@app.route('/')
def index():
    photos = Photo.query.order_by(Photo.created_at.desc()).all()
    
    # Récupérer le contenu
    hero_content = Content.query.filter_by(section='hero').first()
    about_content = Content.query.filter_by(section='about').first()
    services_content = Content.query.filter_by(section='services').first()
    contact_content = Content.query.filter_by(section='contact').first()
    
    return render_template('index.html', 
                         photos=photos,
                         hero=hero_content,
                         about=about_content,
                         services=services_content,
                         contact=contact_content)

# Admin routes
@app.route('/admin')
def admin_login():
    if 'admin_logged_in' in session:
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html')

@app.route('/admin/login', methods=['POST'])
def admin_login_post():
    username = request.form['username']
    password = request.form['password']
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and check_password_hash(admin.password_hash, password):
        session['admin_logged_in'] = True
        return redirect(url_for('admin_dashboard'))
    
    flash('Identifiants incorrects')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    
    photos = Photo.query.order_by(Photo.created_at.desc()).all()
    return render_template('admin_dashboard.html', photos=photos)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('index'))

# API pour photos
@app.route('/admin/add_photo', methods=['POST'])
def add_photo():
    if 'admin_logged_in' not in session:
        return jsonify({'success': False, 'message': 'Non autorisé'})
    
    title = request.form['title']
    description = request.form['description']
    category = request.form['category']
    
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            # Convertir en base64
            image_data = base64.b64encode(file.read()).decode('utf-8')
            image_data = f"data:image/jpeg;base64,{image_data}"
        else:
            return jsonify({'success': False, 'message': 'Aucune image'})
    else:
        image_data = request.form.get('image_url', '')
    
    photo = Photo(
        title=title,
        description=description,
        category=category,
        image_data=image_data
    )
    
    db.session.add(photo)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Photo ajoutée'})

@app.route('/admin/delete_photo/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    if 'admin_logged_in' not in session:
        return jsonify({'success': False})
    
    photo = Photo.query.get_or_404(photo_id)
    db.session.delete(photo)
    db.session.commit()
    
    return jsonify({'success': True})

# API pour contenu
@app.route('/admin/save_content', methods=['POST'])
def save_content():
    if 'admin_logged_in' not in session:
        return jsonify({'success': False})
    
    section = request.form['section']
    data = request.form['data']
    
    content = Content.query.filter_by(section=section).first()
    if content:
        content.data = data
        content.updated_at = datetime.utcnow()
    else:
        content = Content(section=section, data=data)
        db.session.add(content)
    
    db.session.commit()
    return jsonify({'success': True})

# Initialisation
def init_db():
    with app.app_context():
        db.create_all()
        
        # Créer admin par défaut
        if not Admin.query.first():
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('prima2024')
            )
            db.session.add(admin)
            db.session.commit()

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)