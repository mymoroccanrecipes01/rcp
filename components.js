// Components Loader - Pour charger dynamiquement header, footer et contenu des pages

document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
});

async function loadComponents() {
    try {
        // Charger le header
        await loadHeader();
        
        // Charger le contenu de la page
        await loadPageContent();
        
        // Charger le footer
        await loadFooter();
        
        // Initialiser les fonctionnalités après le chargement des composants
        initializeHeaderFunctionality();
        initializeFooterFunctionality();
        
    } catch (error) {
        console.error('Erreur lors du chargement des composants:', error);
    }
}

// Charger le header
async function loadHeader() {
    try {
        const response = await fetch('header.html');
        const headerHTML = await response.text();
        
        // Insérer le header au début du body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
    } catch (error) {
        console.error('Erreur lors du chargement du header:', error);
        // Fallback si le fichier header.html n'existe pas
        createFallbackHeader();
    }
}

// Charger le contenu de la page basé sur l'URL
async function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let contentFile = '';
    let pageTitle = 'Simple Recipes';
    
    // Déterminer quel fichier de contenu charger
    switch(currentPage) {
        case 'index.html':
        case '':
            contentFile = 'pages/home-content.html';
            pageTitle = 'Simple Recipes - Your Loved Ones Will Adore';
            break;
        case 'about.html':
            contentFile = 'pages/about-content.html';
            pageTitle = 'About Us - Simple Recipes';
            break;
        case 'recipes.html':
            contentFile = 'pages/recipes-content.html';
            pageTitle = 'Recipes - Simple Recipes';
            break;
        case 'contact.html':
            contentFile = 'pages/contact-content.html';
            pageTitle = 'Contact - Simple Recipes';
            break;
        default:
            // Pour les pages personnalisées, essayer de charger pages/[nom-page]-content.html
            const pageName = currentPage.replace('.html', '');
            contentFile = `pages/${pageName}-content.html`;
            pageTitle = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - Simple Recipes`;
    }
    
    // Mettre à jour le titre de la page
    document.title = pageTitle;
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
        titleElement.textContent = pageTitle;
    }
    
    try {
        const response = await fetch(contentFile);
        if (response.ok) {
            const contentHTML = await response.text();
            
            // Insérer le contenu dans le main
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = contentHTML;
            } else {
                // Si pas de main-content, créer un main et insérer le contenu
                const header = document.querySelector('.header');
                if (header) {
                    header.insertAdjacentHTML('afterend', `<main class="main-content">${contentHTML}</main>`);
                }
            }
        } else {
            throw new Error(`Fichier de contenu non trouvé: ${contentFile}`);
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        // Créer un contenu par défaut
        createDefaultContent(currentPage);
    }
}

// Charger le footer
async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        const footerHTML = await response.text();
        
        // Insérer le footer à la fin du body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        
    } catch (error) {
        console.error('Erreur lors du chargement du footer:', error);
        // Fallback si le fichier footer.html n'existe pas
        createFallbackFooter();
    }
}

// Créer un contenu par défaut si le fichier n'existe pas
function createDefaultContent(currentPage) {
    const pageName = currentPage.replace('.html', '').replace('-', ' ');
    const defaultContent = `
        <section class="default-content">
            <div class="container">
                <h1>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
                <p>Cette page est en cours de développement.</p>
                <p>Le contenu sera bientôt disponible dans <code>pages/${currentPage.replace('.html', '')}-content.html</code></p>
                <a href="index.html" class="btn-back">← Retour à l'accueil</a>
            </div>
        </section>
    `;
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = defaultContent;
    } else {
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('afterend', `<main class="main-content">${defaultContent}</main>`);
        }
    }
    
    // Ajouter les styles pour le contenu par défaut
    addDefaultContentStyles();
}

// Ajouter les styles pour le contenu par défaut
function addDefaultContentStyles() {
    if (!document.getElementById('default-content-styles')) {
        const style = document.createElement('style');
        style.id = 'default-content-styles';
        style.textContent = `
            .default-content {
                padding: 100px 0;
                text-align: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            .default-content h1 {
                font-size: 48px;
                color: #333;
                margin-bottom: 20px;
            }
            .default-content p {
                font-size: 18px;
                color: #666;
                margin-bottom: 15px;
            }
            .default-content code {
                background: #f1f3f4;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
            }
            .btn-back {
                display: inline-block;
                margin-top: 30px;
                padding: 12px 24px;
                background: #ff6b6b;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                transition: background 0.3s ease;
            }
            .btn-back:hover {
                background: #ff5252;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialiser les fonctionnalités du header
function initializeHeaderFunctionality() {
    // Navigation smooth scroll
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Fonctionnalité de recherche
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = prompt('Que voulez-vous rechercher?');
            
            if (searchTerm) {
                performSearch(searchTerm);
            }
        });
    }

    // Ajouter classe active au lien de navigation actuel
    highlightActiveNavLink();
}

// Initialiser les fonctionnalités du footer
function initializeFooterFunctionality() {
    // Navigation smooth scroll pour les liens du footer
    const footerLinks = document.querySelectorAll('.footer-nav a, .footer-secondary a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Fonctionnalité des réseaux sociaux
    const socialLinks = document.querySelectorAll('.social-icon');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.textContent === '📘' ? 'Facebook' : 
                           this.textContent === '🐦' ? 'Twitter' : 'Instagram';
            
            alert(`Redirection vers ${platform} - Ajoutez vos liens sociaux ici!`);
        });
    });
}

// Mettre en évidence le lien de navigation actuel
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage || 
           (currentPage === '' && linkHref === 'index.html') ||
           (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Fonction de recherche
function performSearch(searchTerm) {
    console.log('Recherche:', searchTerm);
    
    const recipeCards = document.querySelectorAll('.recipe-card, .category-card');
    let foundRecipes = [];
    
    recipeCards.forEach(card => {
        const title = card.querySelector('h3, h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm.toLowerCase()) || 
            description.includes(searchTerm.toLowerCase())) {
            foundRecipes.push(card);
        }
    });
    
    if (foundRecipes.length > 0) {
        foundRecipes[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        foundRecipes.forEach(card => {
            card.style.border = '3px solid #ff6b6b';
            setTimeout(() => {
                card.style.border = '';
            }, 3000);
        });
        
        alert(`${foundRecipes.length} recette(s) trouvée(s) pour "${searchTerm}"`);
    } else {
        alert(`Aucune recette trouvée pour "${searchTerm}"`);
    }
}

// Fallback header si le fichier n'existe pas
function createFallbackHeader() {
    const headerHTML = `
        <header class="header">
            <div class="container">
                <div class="logo">
                    <h2>Simple Recipes</h2>
                </div>
                <nav class="nav">
                    <a href="index.html">Home</a>
                    <a href="about.html">About Us</a>
                    <a href="recipes.html">Recipes</a>
                    <a href="contact.html">Contact</a>
                </nav>
                <button class="search-btn">🔍</button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Fallback footer si le fichier n'existe pas
function createFallbackFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-nav">
                    <a href="index.html">Home</a>
                    <a href="about.html">About Us</a>
                    <a href="recipes.html">Recipes</a>
                    <a href="contact.html">Contact</a>
                </div>
                <div class="social-links">
                    <a href="#" class="social-icon">📘</a>
                    <a href="#" class="social-icon">🐦</a>
                    <a href="#" class="social-icon">📷</a>
                </div>
                <p class="copyright">2025 Simple Recipes. All rights reserved.</p>
            </div>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Ajouter les styles pour le lien actif
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
    .nav a.active {
        color: #ff6b6b;
        font-weight: 600;
        position: relative;
    }
    
    .nav a.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #ff6b6b;
    }
`;
document.head.appendChild(activeNavStyle);('Que voulez-vous rechercher?');
            
            if (searchTerm) {
                performSearch(searchTerm);
            }
        });
    }

    // Ajouter classe active au lien de navigation actuel
    highlightActiveNavLink();
}

// Initialiser les fonctionnalités du footer
function initializeFooterFunctionality() {
    // Navigation smooth scroll pour les liens du footer
    const footerLinks = document.querySelectorAll('.footer-nav a, .footer-secondary a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Fonctionnalité des réseaux sociaux
    const socialLinks = document.querySelectorAll('.social-icon');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.textContent === '📘' ? 'Facebook' : 
                           this.textContent === '🐦' ? 'Twitter' : 'Instagram';
            
            alert(`Redirection vers ${platform} - Ajoutez vos liens sociaux ici!`);
        });
    });
}

// Mettre en évidence le lien de navigation actuel
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage || 
           (currentPage === '' && linkHref === 'index.html') ||
           (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Fonction de recherche
function performSearch(searchTerm) {
    // Cette fonction peut être personnalisée selon les besoins
    console.log('Recherche:', searchTerm);
    
    // Exemple de recherche dans les recettes
    const recipeCards = document.querySelectorAll('.recipe-card');
    let foundRecipes = [];
    
    recipeCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm.toLowerCase()) || 
            description.includes(searchTerm.toLowerCase())) {
            foundRecipes.push(card);
        }
    });
    
    if (foundRecipes.length > 0) {
        // Scroll vers le premier résultat
        foundRecipes[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Mettre en évidence les résultats
        foundRecipes.forEach(card => {
            card.style.border = '3px solid #ff6b6b';
            setTimeout(() => {
                card.style.border = '';
            }, 3000);
        });
        
        alert(`${foundRecipes.length} recette(s) trouvée(s) pour "${searchTerm}"`);
    } else {
        alert(`Aucune recette trouvée pour "${searchTerm}"`);
    }
}

// Fallback header si le fichier n'existe pas
function createFallbackHeader() {
    const headerHTML = `
        <header class="header">
            <div class="container">
                <div class="logo">
                    <h2>Simple Recipes</h2>
                </div>
                <nav class="nav">
                    <a href="index.html">Home</a>
                    <a href="#topics">Topics</a>
                    <a href="#discover">Discover</a>
                    <a href="#about">About Us</a>
                    <a href="#contact">Get In Touch</a>
                </nav>
                <button class="search-btn">🔍</button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Fallback footer si le fichier n'existe pas
function createFallbackFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-nav">
                    <a href="index.html">Home</a>
                    <a href="#writers">Writers</a>
                    <a href="#topics">Topics</a>
                    <a href="#keywords">Keywords</a>
                    <a href="#favorites">Favorites</a>
                    <a href="#discover">Discover</a>
                    <a href="#posts">Posts</a>
                    <a href="#recipes">Recipes</a>
                    <a href="#about">About Us</a>
                    <a href="#privacy">Privacy</a>
                </div>
                <div class="footer-secondary">
                    <a href="#faq">FAQ</a>
                    <a href="#contact">Get In Touch</a>
                    <a href="#search">Search</a>
                    <a href="#sitemap">Site Map</a>
                    <a href="#updates">Updates</a>
                </div>
                <div class="social-links">
                    <a href="#" class="social-icon">📘</a>
                    <a href="#" class="social-icon">🐦</a>
                    <a href="#" class="social-icon">📷</a>
                </div>
                <p class="copyright">2025 Pin Recipes. All rights reserved.</p>
            </div>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Ajouter les styles pour le lien actif
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
    .nav a.active {
        color: #ff6b6b;
        font-weight: 600;
        position: relative;
    }
    
    .nav a.active::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #ff6b6b;
    }
`;
document.head.appendChild(activeNavStyle);