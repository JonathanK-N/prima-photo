// Configuration
const ADMIN_PASSWORD = 'admin123';

// Variables globales
let photos = JSON.parse(localStorage.getItem('portfolioPhotos')) || [];
let currentSection = 'gallery';

// Simple admin protection
function checkAdminAccess() {
    const password = localStorage.getItem('adminAccess');
    if (password !== 'prima2024') {
        const userPassword = prompt('Mot de passe administrateur:');
        if (userPassword === 'prima2024') {
            localStorage.setItem('adminAccess', 'prima2024');
            return true;
        } else {
            if (userPassword !== null) {
                alert('Accès refusé');
            }
            window.location.href = 'index.html';
            return false;
        }
    }
    return true;
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAccess()) return;
    
    // Charger depuis URL si disponible
    urlSync.loadFromURL();
    
    await portfolioDB.init();
    initializeAdmin();
    loadStoredData();
    await loadPhotosFromAPI();
});

// Initialisation de l'admin
function initializeAdmin() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchSection(e.target.dataset.section));
    });
    
    // Formulaires
    document.getElementById('addPhotoForm').addEventListener('submit', addPhoto);
    document.getElementById('contactForm').addEventListener('submit', saveContact);
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
    
    // Upload methods
    document.querySelectorAll('input[name="uploadMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleUploadMethod);
    });
    
    // File previews
    document.getElementById('photoFile').addEventListener('change', previewImage);
    document.getElementById('heroBackgroundImage')?.addEventListener('change', previewHeroImage);
    document.getElementById('aboutImage')?.addEventListener('change', previewAboutImage);
    document.getElementById('siteLogo')?.addEventListener('change', previewLogo);
    
    // Background type change
    document.getElementById('heroBackgroundType')?.addEventListener('change', toggleBackgroundControls);
    
    // About image type change
    document.querySelectorAll('input[name="aboutImageType"]').forEach(radio => {
        radio.addEventListener('change', toggleAboutImageType);
    });
    
    // Sync button
    document.getElementById('syncSite').addEventListener('click', syncToSite);
    
    // About button
    if (document.getElementById('saveAboutBtn')) {
        document.getElementById('saveAboutBtn').addEventListener('click', saveAbout);
    }
}

// Gestion du login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadPhotosGrid();
    } else {
        alert('Mot de passe incorrect');
    }
}

function logout() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Navigation entre sections
function switchSection(section) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Afficher la section sélectionnée
    document.getElementById(section + '-section').classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    currentSection = section;
    
    // Charger les données spécifiques à la section
    if (section === 'hero') loadHeroData();
    if (section === 'gallery') loadPhotosGrid();
}

// Gestion des photos
function toggleUploadMethod() {
    const method = document.querySelector('input[name="uploadMethod"]:checked').value;
    const fileSection = document.getElementById('fileUploadSection');
    const urlSection = document.getElementById('urlUploadSection');
    
    if (method === 'file') {
        fileSection.style.display = 'block';
        urlSection.style.display = 'none';
        document.getElementById('photoFile').required = true;
        document.getElementById('photoUrl').required = false;
    } else {
        fileSection.style.display = 'none';
        urlSection.style.display = 'block';
        document.getElementById('photoFile').required = false;
        document.getElementById('photoUrl').required = true;
    }
}

function previewImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Aperçu" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
    }
}

async function addPhoto(e) {
    e.preventDefault();
    
    const title = document.getElementById('photoTitle').value;
    const description = document.getElementById('photoDescription').value;
    const category = document.getElementById('photoCategory').value;
    const method = document.querySelector('input[name="uploadMethod"]:checked').value;
    
    if (method === 'file') {
        const file = document.getElementById('photoFile').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const photoData = {
                    title,
                    description,
                    category,
                    image: e.target.result
                };
                
                const result = await portfolioAPI.addPhoto(photoData);
                if (result.success) {
                    await loadPhotosFromAPI();
                    document.getElementById('addPhotoForm').reset();
                    document.getElementById('imagePreview').innerHTML = '';
                    showNotification('Photo ajoutée avec succès!');
                }
            };
            reader.readAsDataURL(file);
        }
    } else {
        const url = document.getElementById('photoUrl').value;
        const photoData = {
            title,
            description,
            category,
            image: url
        };
        
        const result = await portfolioAPI.addPhoto(photoData);
        if (result.success) {
            await loadPhotosFromAPI();
            document.getElementById('addPhotoForm').reset();
            showNotification('Photo ajoutée avec succès!');
        }
    }
}

async function loadPhotosFromAPI() {
    photos = await portfolioAPI.getPhotos();
    loadPhotosGrid();
}

function loadPhotosGrid() {
    const grid = document.getElementById('photosList');
    
    if (photos.length === 0) {
        grid.innerHTML = '<p class="no-photos">Aucune photo ajoutée</p>';
        return;
    }
    
    grid.innerHTML = photos.map(photo => `
        <div class="photo-item" data-id="${photo.id}">
            <div class="photo-preview">
                <img src="${photo.image}" alt="${photo.title}">
                <div class="photo-overlay">
                    <button onclick="deletePhoto(${photo.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="photo-info">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
                <span class="category">${photo.category}</span>
            </div>
        </div>
    `).join('');
}

function deletePhoto(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
        photos = photos.filter(photo => photo.id !== id);
        savePhotos();
        loadPhotosGrid();
        showNotification('Photo supprimée');
    }
}

function savePhotos() {
    localStorage.setItem('portfolioPhotos', JSON.stringify(photos));
}

// Synchronisation avec le site
function syncToSite() {
    const button = document.getElementById('syncSite');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Synchronisation...';
    button.disabled = true;
    
    // Simuler la synchronisation
    setTimeout(() => {
        updateSiteContent();
        button.innerHTML = '<i class="fas fa-check"></i> Synchronisé!';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }, 1500);
}

function updateSiteContent() {
    // Synchroniser toutes les données avec le site
    localStorage.setItem('sitePhotos', JSON.stringify(photos));
    
    // Déclencher un événement pour notifier le site principal
    window.dispatchEvent(new Event('storage'));
    
    // Forcer le rechargement si ouvert dans une nouvelle fenêtre
    if (window.opener && !window.opener.closed) {
        window.opener.location.reload();
    }
    
    showNotification('Contenu synchronisé avec le site!');
}

// Gestion des services
async function saveServices() {
    const services = {
        portrait: {
            description: document.getElementById('portraitDesc').value,
            price: document.getElementById('portraitPrice').value
        },
        mariage: {
            description: document.getElementById('mariageDesc').value,
            price: document.getElementById('mariagePrice').value
        },
        evenement: {
            description: document.getElementById('evenementDesc').value,
            price: document.getElementById('evenementPrice').value
        }
    };
    
    await portfolioAPI.saveData('services', services);
    localStorage.setItem('portfolioServices', JSON.stringify(services));
    showNotification('Services sauvegardés!');
}

// Gestion de la section À propos
// Gestion de l'accueil
async function saveHero() {
    const hero = {
        title: document.getElementById('heroTitle').value,
        subtitle: document.getElementById('heroSubtitle').value,
        buttonText: document.getElementById('heroButton').value,
        backgroundType: document.getElementById('heroBackgroundType').value,
        gradientColor1: document.getElementById('gradientColor1').value,
        gradientColor2: document.getElementById('gradientColor2').value,
        backgroundColor: document.getElementById('heroBackgroundColor')?.value,
        backgroundImage: document.getElementById('heroBackgroundImage')?.files[0] ? 
            document.getElementById('heroImagePreview').querySelector('img')?.src : null
    };
    
    await portfolioAPI.saveData('hero', hero);
    showNotification('Section accueil sauvegardée!');
}

function loadHeroData() {
    const hero = JSON.parse(localStorage.getItem('portfolioHero'));
    if (hero) {
        document.getElementById('heroTitle').value = hero.title || '';
        document.getElementById('heroSubtitle').value = hero.subtitle || '';
        document.getElementById('heroButton').value = hero.buttonText || '';
        document.getElementById('heroBackgroundType').value = hero.backgroundType || 'gradient';
        document.getElementById('gradientColor1').value = hero.gradientColor1 || '#667eea';
        document.getElementById('gradientColor2').value = hero.gradientColor2 || '#764ba2';
        
        toggleBackgroundControls();
        
        if (hero.backgroundImage) {
            document.getElementById('heroImagePreview').innerHTML = 
                `<img src="${hero.backgroundImage}" style="max-width: 200px; max-height: 200px;">`;
        }
    }
}

function toggleBackgroundControls() {
    const type = document.getElementById('heroBackgroundType').value;
    
    document.getElementById('gradientControls').style.display = type === 'gradient' ? 'block' : 'none';
    document.getElementById('imageControls').style.display = type === 'image' ? 'block' : 'none';
    document.getElementById('colorControls').style.display = type === 'color' ? 'block' : 'none';
}

function previewHeroImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('heroImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
    }
}

let aboutCropper = null;

async function previewAboutImage(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('aboutImagePreview');
    const cropperContainer = document.getElementById('aboutCropper');
    const cropBtn = document.getElementById('cropAboutBtn');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            // Afficher l'aperçu original
            preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
            
            // Initialiser le cropper
            aboutCropper = new ImageCropper(cropperContainer, {
                aspectRatio: 1, // Ratio carré pour photo de profil
                minWidth: 100,
                minHeight: 100
            });
            
            aboutCropper.init(event.target.result);
            
            // Afficher le cropper et le bouton
            cropperContainer.style.display = 'block';
            cropBtn.style.display = 'block';
            
            // Gérer le bouton de rognage
            cropBtn.onclick = async () => {
                const croppedImage = aboutCropper.crop();
                
                // Convertir en blob pour IndexedDB
                const response = await fetch(croppedImage);
                const blob = await response.blob();
                const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
                
                try {
                    // Sauvegarder l'image rognée dans IndexedDB
                    const imageData = await portfolioDB.saveImage('about-photo', croppedFile);
                    
                    // Mettre à jour l'aperçu avec l'image rognée
                    preview.innerHTML = `<img src="${croppedImage}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
                    
                    // Masquer le cropper
                    cropperContainer.style.display = 'none';
                    cropBtn.style.display = 'none';
                    
                    showNotification('Image rognée et sauvegardée!');
                } catch (error) {
                    console.error('Erreur sauvegarde image rognée:', error);
                    alert('Erreur lors de la sauvegarde');
                }
            };
        };
        reader.readAsDataURL(file);
    }
}

function previewLogo(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('logoPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 50px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function toggleAboutImageType() {
    const type = document.querySelector('input[name="aboutImageType"]:checked').value;
    
    if (type === 'file') {
        document.getElementById('aboutFileUpload').style.display = 'block';
        document.getElementById('aboutLocalPath').style.display = 'none';
    } else {
        document.getElementById('aboutFileUpload').style.display = 'none';
        document.getElementById('aboutLocalPath').style.display = 'block';
    }
}

async function saveAbout() {
    console.log('saveAbout function called');
    
    try {
        const imageType = document.querySelector('input[name="aboutImageType"]:checked').value;
        let imageUrl = null;
        
        if (imageType === 'file') {
            // Récupérer l'image depuis l'aperçu
            const previewImg = document.getElementById('aboutImagePreview').querySelector('img');
            imageUrl = previewImg ? previewImg.src : null;
        } else {
            const imagePath = document.getElementById('aboutImagePath').value;
            imageUrl = imagePath ? imagePath : null;
        }
        
        const about = {
            sectionTitle: document.getElementById('aboutSectionTitle')?.value || '',
            para1: document.getElementById('aboutPara1')?.value || '',
            para2: document.getElementById('aboutPara2')?.value || '',
            image: imageUrl,
            imageType: imageType,
            stats: {
                clients: document.getElementById('statClients')?.value || '',
                clientsLabel: document.getElementById('statClientsLabel')?.value || '',
                mariages: document.getElementById('statMariages')?.value || '',
                mariagesLabel: document.getElementById('statMariagesLabel')?.value || '',
                experience: document.getElementById('statExperience')?.value || '',
                experienceLabel: document.getElementById('statExperienceLabel')?.value || ''
            }
        };
        
        // Sauvegarder dans l'API et IndexedDB
        await portfolioAPI.saveData('about', about);
        await portfolioDB.saveData('portfolioAbout', about);
        
        console.log('About data saved:', about);
        showNotification('Section À propos sauvegardée!');
    } catch (error) {
        console.error('Error in saveAbout:', error);
        alert('Erreur: ' + error.message);
    }
}

// Gestion du contact
async function saveContact(e) {
    e.preventDefault();
    
    const contact = {
        sectionTitle: document.getElementById('contactSectionTitle').value,
        email: document.getElementById('emailAddress').value,
        phone: document.getElementById('phoneNumber').value,
        address: document.getElementById('address').value,
        whatsapp: document.getElementById('whatsappNumber').value,
        formPlaceholders: {
            name: document.getElementById('formNamePlaceholder').value,
            email: document.getElementById('formEmailPlaceholder').value,
            message: document.getElementById('formMessagePlaceholder').value,
            button: document.getElementById('formButtonText').value
        }
    };
    
    await portfolioAPI.saveData('contact', contact);
    localStorage.setItem('portfolioContact', JSON.stringify(contact));
    showNotification('Informations de contact sauvegardées!');
}

// Gestion des paramètres
function saveSettings(e) {
    e.preventDefault();
    
    const settings = {
        galleryTitle: document.getElementById('galleryTitle').value,
        servicesTitle: document.getElementById('servicesTitle').value,
        logo: document.getElementById('logoPreview').querySelector('img')?.src
    };
    
    const newPassword = document.getElementById('newPassword').value;
    if (newPassword) {
        localStorage.setItem('adminPassword', newPassword);
        showNotification('Mot de passe mis à jour!');
    }
    
    localStorage.setItem('portfolioSettings', JSON.stringify(settings));
    updateSiteContent();
    showNotification('Paramètres sauvegardés!');
}

// Chargement des données stockées
function loadStoredData() {
    // Charger les services
    const services = JSON.parse(localStorage.getItem('portfolioServices'));
    if (services) {
        document.getElementById('portraitDesc').value = services.portrait?.description || '';
        document.getElementById('portraitPrice').value = services.portrait?.price || '';
        document.getElementById('mariageDesc').value = services.mariage?.description || '';
        document.getElementById('mariagePrice').value = services.mariage?.price || '';
        document.getElementById('evenementDesc').value = services.evenement?.description || '';
        document.getElementById('evenementPrice').value = services.evenement?.price || '';
    }
    
    // Charger À propos depuis IndexedDB
    loadAboutData();
    
    // Charger contact
    const contact = JSON.parse(localStorage.getItem('portfolioContact'));
    if (contact) {
        document.getElementById('contactSectionTitle').value = contact.sectionTitle || '';
        document.getElementById('emailAddress').value = contact.email || '';
        document.getElementById('phoneNumber').value = contact.phone || '';
        document.getElementById('address').value = contact.address || '';
        document.getElementById('whatsappNumber').value = contact.whatsapp || '';
        
        if (contact.formPlaceholders) {
            document.getElementById('formNamePlaceholder').value = contact.formPlaceholders.name || '';
            document.getElementById('formEmailPlaceholder').value = contact.formPlaceholders.email || '';
            document.getElementById('formMessagePlaceholder').value = contact.formPlaceholders.message || '';
            document.getElementById('formButtonText').value = contact.formPlaceholders.button || '';
        }
    }
    
    // Charger paramètres
    const settings = JSON.parse(localStorage.getItem('portfolioSettings'));
    if (settings) {
        document.getElementById('galleryTitle').value = settings.galleryTitle || '';
        document.getElementById('servicesTitle').value = settings.servicesTitle || '';
        
        if (settings.logo) {
            document.getElementById('logoPreview').innerHTML = 
                `<img src="${settings.logo}" style="max-width: 100px; max-height: 50px;">`;
        }
    }
}

// Export vers JSON pour synchronisation
function exportToJSON() {
    const data = {
        hero: JSON.parse(localStorage.getItem('portfolioHero')) || {},
        about: JSON.parse(localStorage.getItem('portfolioAbout')) || {},
        services: JSON.parse(localStorage.getItem('portfolioServices')) || {},
        contact: JSON.parse(localStorage.getItem('portfolioContact')) || {},
        photos: photos
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Fichier data.json téléchargé ! Remplacez le fichier sur votre serveur.');
}

// Export/Import des données
function exportData() {
    const data = {
        photos: photos,
        services: JSON.parse(localStorage.getItem('portfolioServices')),
        about: JSON.parse(localStorage.getItem('portfolioAbout')),
        contact: JSON.parse(localStorage.getItem('portfolioContact')),
        settings: JSON.parse(localStorage.getItem('portfolioSettings'))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Données exportées!');
}

function importData() {
    document.getElementById('importFile').click();
    
    document.getElementById('importFile').onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.photos) {
                        photos = data.photos;
                        savePhotos();
                        loadPhotosGrid();
                    }
                    
                    if (data.services) localStorage.setItem('portfolioServices', JSON.stringify(data.services));
                    if (data.about) localStorage.setItem('portfolioAbout', JSON.stringify(data.about));
                    if (data.contact) localStorage.setItem('portfolioContact', JSON.stringify(data.contact));
                    if (data.settings) localStorage.setItem('portfolioSettings', JSON.stringify(data.settings));
                    
                    loadStoredData();
                    showNotification('Données importées avec succès!');
                } catch (error) {
                    alert('Erreur lors de l\'importation des données');
                }
            };
            reader.readAsText(file);
        }
    };
}

async function loadAboutData() {
    try {
        const about = await portfolioDB.getData('portfolioAbout');
        if (about) {
            document.getElementById('aboutSectionTitle').value = about.sectionTitle || '';
            document.getElementById('aboutPara1').value = about.para1 || '';
            document.getElementById('aboutPara2').value = about.para2 || '';
            document.getElementById('statClients').value = about.stats?.clients || '';
            document.getElementById('statClientsLabel').value = about.stats?.clientsLabel || '';
            document.getElementById('statMariages').value = about.stats?.mariages || '';
            document.getElementById('statMariagesLabel').value = about.stats?.mariagesLabel || '';
            document.getElementById('statExperience').value = about.stats?.experience || '';
            document.getElementById('statExperienceLabel').value = about.stats?.experienceLabel || '';
            
            if (about.image) {
                document.getElementById('aboutImagePreview').innerHTML = 
                    `<img src="${about.image}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
            }
        }
    } catch (error) {
        console.error('Erreur chargement données About:', error);
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}