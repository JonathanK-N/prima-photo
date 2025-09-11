// Configuration des images (remplacez par vos vraies images)
const portfolioImages = [
    { src: 'https://picsum.photos/800/600?random=1', category: 'portrait', title: 'Portrait 1' },
    { src: 'https://picsum.photos/800/600?random=2', category: 'mariage', title: 'Mariage 1' },
    { src: 'https://picsum.photos/800/600?random=3', category: 'evenement', title: 'Événement 1' },
    { src: 'https://picsum.photos/800/600?random=4', category: 'nature', title: 'Nature 1' },
    { src: 'https://picsum.photos/800/600?random=5', category: 'portrait', title: 'Portrait 2' },
    { src: 'https://picsum.photos/800/600?random=6', category: 'mariage', title: 'Mariage 2' },
    { src: 'https://picsum.photos/800/600?random=7', category: 'evenement', title: 'Événement 2' },
    { src: 'https://picsum.photos/800/600?random=8', category: 'nature', title: 'Nature 2' },
    { src: 'https://picsum.photos/800/600?random=9', category: 'portrait', title: 'Portrait 3' }
];

// Variables globales
let currentImageIndex = 0;
let filteredImages = [...portfolioImages];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    initializeNavigation();
    initializeLightbox();
    initializeScrollEffects();
});

// Navigation mobile
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fermer le menu mobile
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Scroll fluide
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Galerie
function initializeGallery() {
    loadGalleryImages();
    initializeFilters();
}

function loadGalleryImages(images = portfolioImages) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    galleryGrid.innerHTML = images.map((image, index) => `
        <div class="gallery-item" data-category="${image.category}" data-index="${index}">
            <img src="${image.src}" alt="${image.title}" loading="lazy">
            <div class="gallery-overlay">
                <i class="fas fa-search-plus"></i>
            </div>
        </div>
    `).join('');
    
    // Ajouter les événements de clic
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            openLightbox(index);
        });
    });
}

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Ajouter active au bouton cliqué
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            filterGallery(filter);
        });
    });
}

function filterGallery(filter) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    // Fade out
    galleryGrid.style.opacity = '0';
    
    setTimeout(() => {
        if (filter === 'all') {
            filteredImages = [...portfolioImages];
        } else {
            filteredImages = portfolioImages.filter(img => img.category === filter);
        }
        
        loadGalleryImages(filteredImages);
        
        // Fade in
        galleryGrid.style.opacity = '1';
    }, 300);
}

// Lightbox
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Fermer lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigation lightbox
    lightboxPrev.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        updateLightboxImage();
    });
    
    lightboxNext.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        updateLightboxImage();
    });
    
    // Navigation clavier
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                lightboxPrev.click();
            } else if (e.key === 'ArrowRight') {
                lightboxNext.click();
            }
        }
    });
}

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    document.getElementById('lightbox').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateLightboxImage() {
    const lightboxImage = document.querySelector('.lightbox-image');
    const currentImage = filteredImages[currentImageIndex];
    
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.title;
}

// Effets de scroll
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observer les éléments
    document.querySelectorAll('.gallery-item, .stat, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Formulaire de contact
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const button = this.querySelector('button');
    const originalText = button.textContent;
    
    button.textContent = 'Envoi...';
    button.disabled = true;
    
    // Simuler l'envoi
    setTimeout(() => {
        button.textContent = 'Envoyé !';
        button.style.background = '#27ae60';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '#333';
            this.reset();
        }, 2000);
    }, 1500);
});

// Animation hamburger
document.querySelector('.hamburger').addEventListener('click', function() {
    const spans = this.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (this.classList.contains('active')) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            span.style.transform = 'none';
            span.style.opacity = '1';
        }
    });
});

// Chargement des données depuis localStorage (pour l'admin)
function loadStoredImages() {
    const storedPhotos = localStorage.getItem('sitePhotos');
    if (storedPhotos) {
        const photos = JSON.parse(storedPhotos);
        if (photos.length > 0) {
            // Convertir le format admin vers le format galerie
            const convertedImages = photos.map(photo => ({
                src: photo.image,
                category: photo.category,
                title: photo.title
            }));
            
            // Remplacer les images par défaut
            portfolioImages.splice(0, portfolioImages.length, ...convertedImages);
            filteredImages = [...portfolioImages];
            
            // Recharger la galerie
            loadGalleryImages();
        }
    }
    
    // Charger les services
    loadStoredServices();
    
    // Charger les autres données
    loadStoredContent();
}

function loadStoredServices() {
    const services = JSON.parse(localStorage.getItem('portfolioServices'));
    if (services) {
        const serviceCards = document.querySelectorAll('.service-card');
        
        if (services.portrait && serviceCards[0]) {
            serviceCards[0].querySelector('p').textContent = services.portrait.description || 'Séances photo portrait en studio ou extérieur';
            serviceCards[0].querySelector('.price').textContent = services.portrait.price || 'À partir de 150€';
        }
        
        if (services.mariage && serviceCards[1]) {
            serviceCards[1].querySelector('p').textContent = services.mariage.description || 'Couverture complète de votre jour J';
            serviceCards[1].querySelector('.price').textContent = services.mariage.price || 'À partir de 800€';
        }
        
        if (services.evenement && serviceCards[2]) {
            serviceCards[2].querySelector('p').textContent = services.evenement.description || 'Reportage photo pour tous vos événements';
            serviceCards[2].querySelector('.price').textContent = services.evenement.price || 'À partir de 300€';
        }
    }
}

function loadStoredContent() {
    // Charger l'accueil
    const hero = JSON.parse(localStorage.getItem('portfolioHero'));
    if (hero) {
        const heroTitle = document.querySelector('.hero-content h1');
        const heroSubtitle = document.querySelector('.hero-content p');
        const ctaBtn = document.querySelector('.cta-btn');
        const heroImage = document.querySelector('.hero-image');
        
        if (heroTitle && hero.title) heroTitle.textContent = hero.title;
        if (heroSubtitle && hero.subtitle) heroSubtitle.textContent = hero.subtitle;
        if (ctaBtn && hero.buttonText) ctaBtn.textContent = hero.buttonText;
        
        // Appliquer l'arrière-plan
        if (heroImage) {
            if (hero.backgroundType === 'gradient') {
                heroImage.style.background = `linear-gradient(135deg, ${hero.gradientColor1 || '#667eea'} 0%, ${hero.gradientColor2 || '#764ba2'} 100%)`;
            } else if (hero.backgroundType === 'image' && hero.backgroundImage) {
                heroImage.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${hero.backgroundImage}')`;
                heroImage.style.backgroundSize = 'cover';
                heroImage.style.backgroundPosition = 'center';
            } else if (hero.backgroundType === 'color') {
                heroImage.style.background = hero.backgroundColor || '#333333';
            }
        }
    }
    
    // Charger les paramètres généraux
    const settings = JSON.parse(localStorage.getItem('portfolioSettings'));
    if (settings) {
        const galleryTitle = document.querySelector('.gallery h2');
        const servicesTitle = document.querySelector('.services h2');
        const logo = document.querySelector('.nav-brand .logo');
        
        if (galleryTitle && settings.galleryTitle) galleryTitle.textContent = settings.galleryTitle;
        if (servicesTitle && settings.servicesTitle) servicesTitle.textContent = settings.servicesTitle;
        if (logo && settings.logo) logo.src = settings.logo;
    }
    
    // Charger À propos depuis IndexedDB uniquement
    loadAboutFromIndexedDB();
    
    // Charger contact
    const contact = JSON.parse(localStorage.getItem('portfolioContact'));
    if (contact) {
        const contactTitle = document.querySelector('.contact h2');
        const contactItems = document.querySelectorAll('.contact-item span');
        const contactForm = document.querySelector('.contact-form');
        
        if (contactTitle && contact.sectionTitle) contactTitle.textContent = contact.sectionTitle;
        if (contactItems[0] && contact.email) contactItems[0].textContent = contact.email;
        if (contactItems[1] && contact.phone) contactItems[1].textContent = contact.phone;
        if (contactItems[2] && contact.address) contactItems[2].textContent = contact.address;
        
        // Ajouter un bouton WhatsApp si configuré
        if (contact.whatsapp || contact.whatsappNumber) {
            setTimeout(() => {
                addWhatsAppButton(contact.whatsapp || contact.whatsappNumber);
            }, 100);
        }
        
        if (contactForm && contact.formPlaceholders) {
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageTextarea = contactForm.querySelector('textarea');
            const submitButton = contactForm.querySelector('button');
            
            if (nameInput && contact.formPlaceholders.name) nameInput.placeholder = contact.formPlaceholders.name;
            if (emailInput && contact.formPlaceholders.email) emailInput.placeholder = contact.formPlaceholders.email;
            if (messageTextarea && contact.formPlaceholders.message) messageTextarea.placeholder = contact.formPlaceholders.message;
            if (submitButton && contact.formPlaceholders.button) submitButton.textContent = contact.formPlaceholders.button;
        }
    }
}

// Charger les données depuis l'API
async function loadDataFromAPI() {
    try {
        const hero = await portfolioAPI.getData('hero');
        const about = await portfolioAPI.getData('about');
        const services = await portfolioAPI.getData('services');
        const contact = await portfolioAPI.getData('contact');
        const photos = await portfolioAPI.getPhotos();
        
        const data = { hero, about, services, contact, photos };
        
        // Appliquer les données JSON
        if (data.hero) {
            const heroTitle = document.querySelector('.hero-content h1');
            const heroSubtitle = document.querySelector('.hero-content p');
            const ctaBtn = document.querySelector('.cta-btn');
            
            if (heroTitle && data.hero.title) heroTitle.textContent = data.hero.title;
            if (heroSubtitle && data.hero.subtitle) heroSubtitle.textContent = data.hero.subtitle;
            if (ctaBtn && data.hero.buttonText) ctaBtn.textContent = data.hero.buttonText;
        }
        
        if (data.about) {
            const aboutTitle = document.querySelector('.about h2');
            const aboutText = document.querySelector('.about-text p');
            const stats = document.querySelectorAll('.stat .number');
            const statLabels = document.querySelectorAll('.stat .label');
            
            if (aboutTitle && data.about.sectionTitle) aboutTitle.textContent = data.about.sectionTitle;
            if (aboutText && data.about.para1) aboutText.textContent = data.about.para1;
            
            if (data.about.stats) {
                if (stats[0] && data.about.stats.clients) stats[0].textContent = data.about.stats.clients + '+';
                if (stats[1] && data.about.stats.mariages) stats[1].textContent = data.about.stats.mariages + '+';
                if (stats[2] && data.about.stats.experience) stats[2].textContent = data.about.stats.experience;
                
                if (statLabels[0] && data.about.stats.clientsLabel) statLabels[0].textContent = data.about.stats.clientsLabel;
                if (statLabels[1] && data.about.stats.mariagesLabel) statLabels[1].textContent = data.about.stats.mariagesLabel;
                if (statLabels[2] && data.about.stats.experienceLabel) statLabels[2].textContent = data.about.stats.experienceLabel;
            }
        }
        
        if (data.services) {
            const serviceCards = document.querySelectorAll('.service-card');
            
            if (data.services.portrait && serviceCards[0]) {
                serviceCards[0].querySelector('p').textContent = data.services.portrait.description;
                serviceCards[0].querySelector('.price').textContent = data.services.portrait.price;
            }
            
            if (data.services.mariage && serviceCards[1]) {
                serviceCards[1].querySelector('p').textContent = data.services.mariage.description;
                serviceCards[1].querySelector('.price').textContent = data.services.mariage.price;
            }
            
            if (data.services.evenement && serviceCards[2]) {
                serviceCards[2].querySelector('p').textContent = data.services.evenement.description;
                serviceCards[2].querySelector('.price').textContent = data.services.evenement.price;
            }
        }
        
        if (data.contact) {
            const contactItems = document.querySelectorAll('.contact-item span');
            
            if (contactItems[0] && data.contact.email) contactItems[0].textContent = data.contact.email;
            if (contactItems[1] && data.contact.phone) contactItems[1].textContent = data.contact.phone;
            if (contactItems[2] && data.contact.address) contactItems[2].textContent = data.contact.address;
            
            // Ajouter bouton WhatsApp si configuré
            if (data.contact.whatsapp || data.contact.whatsappNumber) {
                addWhatsAppButton(data.contact.whatsapp || data.contact.whatsappNumber);
            }
        }
        
        console.log('Données API chargées');
    } catch (error) {
        console.log('Pas de connexion API, utilisation des données par défaut');
    }
}

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    // Priorité à l'API pour la synchronisation
    loadDataFromAPI();
    
    // Fallback local seulement si API échoue
    setTimeout(() => {
        loadStoredImages();
        loadAboutFromIndexedDB();
    }, 1000);
});

// Écouter les changements de localStorage
window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('portfolio')) {
        setTimeout(() => {
            loadStoredImages();
            loadAboutFromIndexedDB();
        }, 100);
    }
});

// Fonction de réservation WhatsApp
function reserveService(serviceType) {
    const contact = JSON.parse(localStorage.getItem('portfolioContact'));
    let whatsappNumber = contact?.whatsapp;
    
    // Fallback: essayer de récupérer depuis les autres sources
    if (!whatsappNumber) {
        whatsappNumber = contact?.whatsappNumber;
    }
    
    if (!whatsappNumber) {
        alert('Numéro WhatsApp non configuré. Veuillez configurer le numéro dans l\'administration.');
        return;
    }
    
    const serviceNames = {
        portrait: 'Portrait',
        mariage: 'Mariage', 
        evenement: 'Événement'
    };
    
    const serviceName = serviceNames[serviceType] || serviceType;
    const message = `Bonjour, je souhaite réserver une séance ${serviceName}. Pouvez-vous me donner plus d'informations sur vos disponibilités et tarifs ?`;
    
    // Nettoyer le numéro (enlever espaces, + et autres caractères)
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Fonction pour charger depuis IndexedDB
async function loadAboutFromIndexedDB() {
    try {
        await portfolioDB.init();
        const about = await portfolioDB.getData('portfolioAbout');
        
        if (about) {
            const aboutTitle = document.querySelector('.about h2');
            const aboutText = document.querySelector('.about-text p');
            const aboutImage = document.querySelector('.about-image');
            const stats = document.querySelectorAll('.stat .number');
            const statLabels = document.querySelectorAll('.stat .label');
            
            if (aboutTitle && about.sectionTitle) aboutTitle.textContent = about.sectionTitle;
            if (aboutText && about.para1) aboutText.textContent = about.para1;
            
            if (aboutImage) {
                if (about.image) {
                    aboutImage.innerHTML = `<img src="${about.image}" alt="Photographe" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                } else {
                    aboutImage.innerHTML = '<div class="placeholder">Photo du photographe</div>';
                }
            }
            
            if (about.stats) {
                if (stats[0] && about.stats.clients) stats[0].textContent = about.stats.clients + '+';
                if (stats[1] && about.stats.mariages) stats[1].textContent = about.stats.mariages + '+';
                if (stats[2] && about.stats.experience) stats[2].textContent = about.stats.experience;
                
                if (statLabels[0] && about.stats.clientsLabel) statLabels[0].textContent = about.stats.clientsLabel;
                if (statLabels[1] && about.stats.mariagesLabel) statLabels[1].textContent = about.stats.mariagesLabel;
                if (statLabels[2] && about.stats.experienceLabel) statLabels[2].textContent = about.stats.experienceLabel;
            }
            
            console.log('About loaded from IndexedDB:', about);
        }
    } catch (error) {
        console.error('Erreur chargement IndexedDB:', error);
    }
}

// Synchronisation améliorée
function forceSync() {
    loadDataFromAPI();
    console.log('Synchronisation forcée');
}

// Écouter les changements de données
window.addEventListener('dataChanged', function(event) {
    console.log('Données changées, rechargement...');
    setTimeout(forceSync, 100);
});

// Recharger le contenu toutes les 5 secondes
setInterval(forceSync, 5000);

// Synchronisation au focus de la fenêtre
window.addEventListener('focus', forceSync);

// Synchronisation sur changement de localStorage
window.addEventListener('storage', forceSync);

// Fonction pour ajouter le bouton WhatsApp
function addWhatsAppButton(whatsappNumber) {
    const contactActions = document.querySelector('.contact-actions');
    if (!contactActions) return;
    
    // Vérifier si le bouton existe déjà
    if (document.querySelector('.whatsapp-btn')) {
        document.querySelector('.whatsapp-btn').remove();
    }
    
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const message = "Bonjour, je souhaite obtenir plus d'informations sur vos services de photographie.";
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    const whatsappBtn = document.createElement('button');
    whatsappBtn.className = 'whatsapp-btn';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Contacter sur WhatsApp';
    whatsappBtn.style.cssText = `
        background: #25D366;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background 0.3s ease;
        width: 100%;
        justify-content: center;
    `;
    
    whatsappBtn.addEventListener('mouseover', () => {
        whatsappBtn.style.background = '#128C7E';
    });
    
    whatsappBtn.addEventListener('mouseout', () => {
        whatsappBtn.style.background = '#25D366';
    });
    
    whatsappBtn.addEventListener('click', () => {
        window.open(whatsappUrl, '_blank');
    });
    
    contactActions.appendChild(whatsappBtn);
}