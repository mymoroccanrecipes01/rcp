// Système de routage mis à jour pour base.html

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
    },
    'recipe-detail': {
        title: 'Recipe Detail - Simple Recipes',
        content: 'pages/recipe-detail-content.html'
    }
};

// Variables globales
let currentPage = 'home';
let currentRecipeId = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeRouter();
});

// Initialiser le routeur
function initializeRouter() {
    // Récupérer la page et les paramètres depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPage = urlParams.get('page') || 'home';
    const recipeId = urlParams.get('id');
    
    // Si c'est une page de détail de recette
    if (requestedPage === 'recipe-detail' && recipeId) {
        currentRecipeId = parseInt(recipeId);
        loadRecipeDetailPage(recipeId);
    } else {
        // Charger la page normale
        loadPage(requestedPage);
    }
    
    // Écouter les clics sur les liens de navigation
    setupNavigationLinks();
    
    // Écouter les changements d'URL (bouton retour)
    window.addEventListener('popstate', function(event) {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        const recipeId = urlParams.get('id');
        
        if (page === 'recipe-detail' && recipeId) {
            loadRecipeDetailPage(recipeId, false);
        } else {
            loadPage(page, false);
        }
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
    
    // Gérer les liens du footer
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

// Charger une page normale
async function loadPage(pageName, addToHistory = true) {
    if (!pages[pageName]) {
        console.error(`Page "${pageName}" not found`);
        pageName = 'home';
    }
    
    const pageConfig = pages[pageName];
    
    try {
        showLoadingIndicator();
        
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
        
        // Mettre à jour l'URL
        if (addToHistory) {
            const newUrl = `${window.location.pathname}?page=${pageName}`;
            window.history.pushState({ page: pageName }, pageConfig.title, newUrl);
        }
        
        // Mettre à jour la navigation active
        updateActiveNavigation(pageName);
        
        currentPage = pageName;
        currentRecipeId = null;
        
        // Initialiser les fonctionnalités spécifiques
        initializePageFeatures(pageName);
        
        hideLoadingIndicator();
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        hideLoadingIndicator();
        showErrorPage(pageName);
    }
}

// Charger une page de détail de recette
async function loadRecipeDetailPage(recipeId, addToHistory = true) {
    try {
        showLoadingIndicator();
        
        // Charger le contenu de la page de détail
        const response = await fetch('pages/recipe-detail-content.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        
        // Mettre à jour le contenu
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = content;
        
        // Mettre à jour l'URL
        if (addToHistory) {
            const newUrl = `${window.location.pathname}?page=recipe-detail&id=${recipeId}`;
            window.history.pushState({ page: 'recipe-detail', id: recipeId }, 'Recipe Detail', newUrl);
        }
        
        // Enlever la classe active de tous les liens
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => link.classList.remove('active'));
        
        currentPage = 'recipe-detail';
        currentRecipeId = parseInt(recipeId);
        
        // Initialiser la page de recette avec l'ID
        initializeRecipeDetailPage(recipeId);
        
        hideLoadingIndicator();
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page de recette:', error);
        hideLoadingIndicator();
        showErrorPage('recipe-detail');
    }
}

// Mettre à jour la navigation active
function updateActiveNavigation(pageName) {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
}

// Initialiser les fonctionnalités spécifiques à chaque page
function initializePageFeatures(pageName) {
    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
        switch (pageName) {
            case 'home':
                if (typeof window.initHomePageFeatures === 'function') {
                    window.initHomePageFeatures();
                }
                break;
            case 'recipes':
                if (typeof window.initRecipesPageFeatures === 'function') {
                    window.initRecipesPageFeatures();
                }
                // Ajouter les gestionnaires d'événements pour les cartes de recette
                setupRecipeCardListeners();
                break;
            case 'about':
                if (typeof window.initAboutPageFeatures === 'function') {
                    window.initAboutPageFeatures();
                }
                break;
            case 'contact':
                if (typeof window.initContactPageFeatures === 'function') {
                    window.initContactPageFeatures();
                }
                break;
        }
        
        // Toujours configurer les liens de recette après le chargement
        setupRecipeCardListeners();
    }, 100);
}

// Configurer les listeners pour les cartes de recette
function setupRecipeCardListeners() {
    // Attendre un peu plus pour s'assurer que le contenu est chargé
    setTimeout(() => {
        const recipeCards = document.querySelectorAll('.recipe-card');
        recipeCards.forEach(card => {
            // Enlever les anciens listeners pour éviter les doublons
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // Ajouter le nouveau listener
            newCard.addEventListener('click', function() {
                // Essayer de trouver l'ID de la recette
                let recipeId = this.getAttribute('data-recipe-id');
                
                // Si pas d'attribut data-recipe-id, essayer d'extraire depuis onclick
                if (!recipeId && this.getAttribute('onclick')) {
                    const onclickValue = this.getAttribute('onclick');
                    const match = onclickValue.match(/openRecipe\((\d+)\)/);
                    if (match) {
                        recipeId = match[1];
                    }
                }
                
                // Si toujours pas d'ID, utiliser un ID par défaut basé sur l'index
                if (!recipeId) {
                    const allCards = Array.from(document.querySelectorAll('.recipe-card'));
                    recipeId = allCards.indexOf(this) + 1;
                }
                
                if (recipeId) {
                    loadRecipeDetailPage(recipeId);
                }
            });
        });
    }, 200);
}

// Fonction globale pour ouvrir une recette (utilisée dans les pages)
window.openRecipe = function(recipeId) {
    loadRecipeDetailPage(recipeId);
};

// Afficher l'indicateur de chargement
function showLoadingIndicator() {
    // Créer ou afficher l'indicateur de chargement
    let loader = document.getElementById('page-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const loaderContent = loader.querySelector('.loader-content');
        loaderContent.style.cssText = `
            text-align: center;
            color: #333;
        `;
        
        const spinner = loader.querySelector('.spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff6b6b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        `;
        
        // Ajouter l'animation CSS
        if (!document.getElementById('loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loader);
    }
    
    loader.style.display = 'flex';
    setTimeout(() => {
        loader.style.opacity = '1';
    }, 10);
}

// Masquer l'indicateur de chargement
function hideLoadingIndicator() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

// Afficher une page d'erreur
function showErrorPage(attemptedPage) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="error-page">
            <div class="container">
                <div class="error-content">
                    <h1>Oops! Quelque chose s'est mal passé</h1>
                    <p>Nous n'avons pas pu charger la page "${attemptedPage}". Veuillez réessayer.</p>
                    <div class="error-actions">
                        <button onclick="loadPage('home')" class="btn btn-primary">
                            Retour à l'accueil
                        </button>
                        <button onclick="location.reload()" class="btn btn-secondary">
                            Recharger la page
                        </button>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // Ajouter les styles pour la page d'erreur
    if (!document.getElementById('error-page-styles')) {
        const style = document.createElement('style');
        style.id = 'error-page-styles';
        style.textContent = `
            .error-page {
                padding: 100px 0;
                text-align: center;
                min-height: 60vh;
                display: flex;
                align-items: center;
            }
            .error-content h1 {
                font-size: 36px;
                color: #333;
                margin-bottom: 20px;
            }
            .error-content p {
                font-size: 18px;
                color: #666;
                margin-bottom: 30px;
            }
            .error-actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .error-actions .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s ease;
            }
            .error-actions .btn-primary {
                background: #ff6b6b;
                color: white;
            }
            .error-actions .btn-primary:hover {
                background: #ff5252;
            }
            .error-actions .btn-secondary {
                background: white;
                color: #333;
                border: 2px solid #e9ecef;
            }
            .error-actions .btn-secondary:hover {
                border-color: #ff6b6b;
                color: #ff6b6b;
            }
        `;
        document.head.appendChild(style);
    }
}

// Fonction utilitaire pour obtenir les paramètres d'URL
function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

// Fonction utilitaire pour obtenir la page actuelle
function getCurrentPage() {
    return currentPage;
}

// Fonction utilitaire pour obtenir l'ID de recette actuel
function getCurrentRecipeId() {
    return currentRecipeId;
}

// Exporter les fonctions utiles
window.router = {
    loadPage,
    loadRecipeDetailPage,
    getCurrentPage,
    getCurrentRecipeId,
    getUrlParams
};

console.log('Router.js chargé et initialisé');