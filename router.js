// Système de routage simple pour base.html

// Configuration des pages
const pages = {
    home: {
        title: 'Simple Recipes - Your Loved Ones Will Adore',
        content: 'pages/home-content.html'
    },
    about: {
        title: 'About Us - Simple Recipes',
        content: 'pages/about-content.html'
    },
    recipes: {
        title: 'Recipes - Simple Recipes',
        content: 'pages/recipes-content.html'
    },
    contact: {
        title: 'Contact - Simple Recipes',
        content: 'pages/contact-content.html'
    }
};

// Variables globales
let currentPage = 'home';

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeRouter();
});

// Initialiser le routeur
function initializeRouter() {
    // Récupérer la page depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPage = urlParams.get('page') || 'home';
    
    // Charger la page demandée
    loadPage(requestedPage);
    
    // Écouter les clics sur les liens de navigation
    setupNavigationLinks();
    
    // Écouter les changements d'URL (bouton retour)
    window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        loadPage(page, false); // false = ne pas ajouter à l'historique
    });
}

// Configurer les liens de navigation
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('a[data-page]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);
        });
    });
    
    // Gérer aussi les liens du footer
    const footerLinks = document.querySelectorAll('.footer-nav a[href^="?page="], .footer-secondary a[href^="?page="]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = new URL(this.href);
            const page = url.searchParams.get('page');
            if (page) {
                loadPage(page);
            }
        });
    });
}

// Charger une page
async function loadPage(pageName, addToHistory = true) {
    // Vérifier si la page existe
    if (!pages[pageName]) {
        console.error(`Page "${pageName}" not found`);
        pageName = 'home'; // Rediriger vers l'accueil
    }
    
    const pageConfig = pages[pageName];
    
    try {
        // Afficher un indicateur de chargement
        showLoadingIndicator();
        
        // Charger le contenu de la page
        const response = await fetch(pageConfig.content);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        
        // Mettre à jour le contenu
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = content;
        
        // Mettre à jour le titre
        document.title = pageConfig.title;
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = pageConfig.title;
        }
        
        // Mettre à jour l'URL si nécessaire
        if (addToHistory) {
            const newUrl = `${window.location.pathname}?page=${pageName}`;
            window.history.pushState({ page: pageName }, pageConfig.title, newUrl);
        }
        
        // Mettre à jour la navigation active
        updateActiveNavigation(pageName);
        
        // Mettre à jour la page courante
        currentPage = pageName;
        
        // Initialiser les fonctionnalités spécifiques à la page
        initializePageFeatures(pageName);
        
        // Cacher l'indicateur de chargement
        hideLoadingIndicator();
        
        // Scroller vers le haut
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        hideLoadingIndicator();
        showErrorPage(pageName);
    }
}

// Mettre à jour la navigation active
function updateActiveNavigation(pageName) {
    // Enlever la classe active de tous les liens
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Ajouter la classe active au lien correspondant
    const activeLink = document.querySelector(`.nav a[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Afficher un indicateur de chargement
function showLoadingIndicator() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Chargement...</p>
        </div>
    `;
    
    // Ajouter les styles CSS pour le spinner
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                text-align: center;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #ff6b6b;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-container p {
                color: #666;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Cacher l'indicateur de chargement
function hideLoadingIndicator() {
    // L'indicateur sera remplacé par le contenu de la page
}

// Afficher une page d'erreur
function showErrorPage(attemptedPage) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="error-page">
            <div class="container">
                <h1>Oops! Page non trouvée</h1>
                <p>Désolé, nous n'avons pas pu charger la page "${attemptedPage}".</p>
                <div class="error-actions">
                    <button onclick="loadPage('home')" class="btn-primary">
                        Retour à l'accueil
                    </button>
                    <button onclick="location.reload()" class="btn-secondary">
                        Recharger la page
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Ajouter les styles pour la page d'erreur
    if (!document.getElementById('error-styles')) {
        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            .error-page {
                min-height: 500px;
                display: flex;
                align-items: center;
                text-align: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .error-page h1 {
                font-size: 48px;
                color: #333;
                margin-bottom: 20px;
            }
            
            .error-page p {
                font-size: 18px;
                color: #666;
                margin-bottom: 30px;
            }
            
            .error-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: #ff6b6b;
                color: white;
            }
            
            .btn-primary:hover {
                background: #ff5252;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #5a6268;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialiser les fonctionnalités spécifiques à chaque page
function initializePageFeatures(pageName) {
    // Attendre un peu que le contenu soit rendu
    setTimeout(() => {
        switch(pageName) {
            case 'recipes':
                initializeRecipesPage();
                break;
            case 'contact':
                initializeContactPage();
                break;
            case 'about':
                initializeAboutPage();
                break;
            case 'home':
                initializeHomePage();
                break;
        }
        
        // Réinitialiser les fonctionnalités communes
        initializeCommonFeatures();
    }, 100);
}

// Fonctionnalités communes à toutes les pages
function initializeCommonFeatures() {
    // Réinitialiser les cartes de recettes
    const recipeCards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    recipeCards.forEach(card => {
        // Enlever les anciens event listeners en clonant l'élément
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Ajouter les nouveaux event listeners
        newCard.addEventListener('click', function() {
            const title = this.querySelector('h3, h4');
            if (title) {
                showRecipeModal(title.textContent);
            }
        });
    });
    
    // Réinitialiser le scroll vers le haut
    createScrollToTopButton();
    
    // Réinitialiser la recherche
    initializeSearch();
}

// Fonctions d'initialisation spécifiques (seront définies dans main.js)
function initializeRecipesPage() {
    // Sera définie dans main.js
    if (window.initRecipesPageFeatures) {
        window.initRecipesPageFeatures();
    }
}

function initializeContactPage() {
    // Sera définie dans main.js
    if (window.initContactPageFeatures) {
        window.initContactPageFeatures();
    }
}

function initializeAboutPage() {
    // Sera définie dans main.js
    if (window.initAboutPageFeatures) {
        window.initAboutPageFeatures();
    }
}

function initializeHomePage() {
    // Sera définie dans main.js
    if (window.initHomePageFeatures) {
        window.initHomePageFeatures();
    }
}

// Fonction de recherche globale
function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        // Enlever l'ancien event listener
        const newSearchBtn = searchBtn.cloneNode(true);
        searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
        
        // Ajouter le nouveau event listener
        newSearchBtn.addEventListener('click', function() {
            const searchTerm = prompt('Que voulez-vous rechercher ?');
            if (searchTerm) {
                performGlobalSearch(searchTerm);
            }
        });
    }
}

// Recherche globale
function performGlobalSearch(searchTerm) {
    const recipeCards = document.querySelectorAll('.recipe-card, .category-card');
    let foundItems = [];
    
    recipeCards.forEach(card => {
        const title = card.querySelector('h3, h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm.toLowerCase()) || 
            description.includes(searchTerm.toLowerCase())) {
            foundItems.push(card);
        }
    });
    
    if (foundItems.length > 0) {
        // Scroll vers le premier résultat
        foundItems[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Mettre en évidence les résultats
        foundItems.forEach(card => {
            card.style.border = '3px solid #ff6b6b';
            card.style.borderRadius = '12px';
            setTimeout(() => {
                card.style.border = '';
                card.style.borderRadius = '';
            }, 3000);
        });
        
        alert(`${foundItems.length} résultat(s) trouvé(s) pour "${searchTerm}"`);
    } else {
        alert(`Aucun résultat trouvé pour "${searchTerm}"`);
    }
}

// Créer le bouton scroll to top
function createScrollToTopButton() {
    // Supprimer l'ancien bouton s'il existe
    const existingBtn = document.querySelector('.scroll-to-top');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 999;
    `;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(scrollBtn);
    
    // Gérer l'affichage du bouton selon le scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.pointerEvents = 'auto';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.pointerEvents = 'none';
        }
    });
}

// Modal pour les recettes
function showRecipeModal(recipeName) {
    // Supprimer l'ancienne modal si elle existe
    const existingModal = document.querySelector('.recipe-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'recipe-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #333;">${recipeName}</h2>
        <p style="margin-bottom: 30px; color: #666; line-height: 1.6;">
            Ceci est un aperçu de la recette. Dans une vraie application, 
            vous verriez ici les ingrédients, les instructions, le temps de cuisson et les informations nutritionnelles.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="modal-btn view-recipe" style="
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.3s ease;
            ">Voir la Recette</button>
            <button class="modal-btn close-modal" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.3s ease;
            ">Fermer</button>
        </div>
    `;
    
    // Event listeners pour la modal
    const closeBtn = modalContent.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    const viewBtn = modalContent.querySelector('.view-recipe');
    viewBtn.addEventListener('click', () => {
        alert(`Ouverture de la recette: ${recipeName}`);
    });
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Afficher la modal
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 100);
}

// Exposer les fonctions globalement
window.loadPage = loadPage;
window.currentPage = () => currentPage;