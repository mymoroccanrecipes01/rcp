// Recipe Website JavaScript - Compatible avec le système de routage

document.addEventListener('DOMContentLoaded', function() {
    // Les fonctionnalités seront initialisées par router.js
    console.log('Main.js chargé - Le routeur gère l\'initialisation des pages');
});

// Fonctionnalités spécifiques à la page des recettes
window.initRecipesPageFeatures = function() {
    console.log('Initialisation des fonctionnalités de la page Recipes');
    
    // Filtres de recettes
    const filterBtns = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('.recipe-card[data-category]');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Enlever la classe active des autres boutons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                filterRecipes(filter, recipeCards);
            });
        });
    }
    
    // Pagination
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('next') && !this.classList.contains('prev')) {
                pageButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
};

// Filtrer les recettes par catégorie
function filterRecipes(category, cards) {
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardCategories = card.getAttribute('data-category')?.split(' ') || [];
        
        if (category === 'all' || cardCategories.includes(category)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mettre à jour le compteur
    const countElement = document.getElementById('recipe-count');
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

// Fonctionnalités spécifiques à la page de contact
window.initContactPageFeatures = function() {
    console.log('Initialisation des fonctionnalités de la page Contact');
    
    // Validation du formulaire de contact
    const form = document.querySelector('.contact-form');
    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Animation des éléments de contact
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300);
    });
};

// Validation d'un champ de formulaire
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Enlever les erreurs précédentes
    clearFieldError(field);
    
    // Validation en fonction du type de champ
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide';
        }
    }
    
    // Afficher l'erreur si nécessaire
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Afficher une erreur sur un champ
function showFieldError(field, message) {
    field.style.borderColor = '#ff6b6b';
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Effacer l'erreur d'un champ
function clearFieldError(field) {
    field.style.borderColor = '#e9ecef';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Soumettre le formulaire de contact
window.submitContactForm = function() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    
    // Valider tous les champs
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (isFormValid) {
        // Simuler l'envoi du formulaire
        const submitBtn = document.querySelector('.submit-btn');
        if (!submitBtn) return;
        
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Message envoyé avec succès! Nous vous répondrons bientôt.');
            
            // Réinitialiser le formulaire
            inputs.forEach(input => {
                input.value = '';
                clearFieldError(input);
            });
            
            // Réinitialiser le select
            const selectElement = form.querySelector('select');
            if (selectElement) {
                selectElement.selectedIndex = 0;
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    } else {
        alert('Veuillez corriger les erreurs dans le formulaire.');
    }
};

// Fonctionnalités spécifiques à la page À propos
window.initAboutPageFeatures = function() {
    console.log('Initialisation des fonctionnalités de la page About');
    
    // Animation des membres de l'équipe
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        member.style.opacity = '0';
        member.style.transform = 'translateY(30px)';
        member.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            member.style.opacity = '1';
            member.style.transform = 'translateY(0)';
        }, 500);
    });
};

// Fonctionnalités spécifiques à la page d'accueil
window.initHomePageFeatures = function() {
    console.log('Initialisation des fonctionnalités de la page Home');
    
    // Animation du hero
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(20px)';
        hero.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            hero.style.opacity = '1';
            hero.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Animation des cartes au scroll
    animateCardsOnScroll();
};

// Animer les cartes au scroll
function animateCardsOnScroll() {
    const cards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    // Créer l'observateur d'intersection
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Appliquer l'animation initiale et observer chaque carte
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        cardObserver.observe(card);
    });
}

// Smooth scrolling pour les ancres
function initializeSmoothScrolling() {
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link && !link.getAttribute('href').includes('?page=')) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

// Initialiser le smooth scrolling dès le chargement
initializeSmoothScrolling();

// Lazy loading pour les images
function implementLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Ajouter une transition pour l'apparition
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                
                // Si l'image est déjà chargée (cache)
                if (img.complete) {
                    img.style.opacity = '1';
                }
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Réinitialiser le lazy loading à chaque changement de page
function reinitializeLazyLoading() {
    setTimeout(() => {
        implementLazyLoading();
    }, 100);
}

// Ajouter les styles CSS globaux
function addGlobalStyles() {
    if (!document.getElementById('global-animations')) {
        const style = document.createElement('style');
        style.id = 'global-animations';
        style.textContent = `
            @keyframes fadeInUp {
                from { 
                    opacity: 0; 
                    transform: translateY(20px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInLeft {
                from { 
                    opacity: 0;
                    transform: translateX(-20px); 
                }
                to { 
                    opacity: 1;
                    transform: translateX(0); 
                }
            }
            
            .recipe-card, .category-card, .pick-card {
                position: relative;
            }
            
            .field-error {
                animation: fadeIn 0.3s ease;
            }
            
            /* Navigation active */
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
                border-radius: 1px;
            }
            
            /* Hover effects */
            .recipe-card:hover, .category-card:hover, .pick-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            /* Filter button animations */
            .filter-btn {
                position: relative;
                overflow: hidden;
            }
            
            .filter-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                transition: left 0.5s ease;
            }
            
            .filter-btn:hover::before {
                left: 100%;
            }
            
            /* Loading animations */
            .fade-in {
                animation: fadeIn 0.5s ease forwards;
            }
            
            .slide-in-left {
                animation: slideInLeft 0.5s ease forwards;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .nav a.active::after {
                    bottom: -3px;
                    height: 1px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialiser les styles globaux
addGlobalStyles();

// Fonction utilitaire pour débouncer les événements
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimiser le scroll listener
const optimizedScrollHandler = debounce(() => {
    // Handler optimisé pour le scroll
    const scrollTop = window.pageYOffset;
    const scrollBtn = document.querySelector('.scroll-to-top');
    
    if (scrollBtn) {
        if (scrollTop > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.pointerEvents = 'auto';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.pointerEvents = 'none';
        }
    }
}, 10);

// Ajouter le listener de scroll optimisé
window.addEventListener('scroll', optimizedScrollHandler);

// Fonctions utilitaires globales
window.utils = {
    // Fonction pour faire apparaître un élément
    fadeIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    // Fonction pour faire disparaître un élément
    fadeOut: function(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },
    
    // Fonction pour animer l'apparition d'une liste d'éléments
    staggerAnimation: function(elements, delay = 100) {
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.6s ease ${index * delay}ms, transform 0.6s ease ${index * delay}ms`;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 50);
        });
    }
};

// Écouter les changements de page pour réinitialiser les fonctionnalités
window.addEventListener('popstate', () => {
    setTimeout(() => {
        reinitializeLazyLoading();
        animateCardsOnScroll();
    }, 200);
});

// Log pour debug
console.log('Main.js complètement chargé - Toutes les fonctionnalités sont disponibles');// Recipe Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Attendre que les composants soient chargés
    setTimeout(function() {
        initializePageSpecificFeatures();
    }, 500);
    
    // Smooth scrolling pour les liens de navigation
    initializeSmoothScrolling();

    // Search functionality
    initializeSearch();

    // Recipe card interactions
    initializeRecipeCards();

    // Scroll-to-top functionality
    createScrollToTopButton();

    // Lazy loading for images
    implementLazyLoading();

    // Add loading animation for recipe cards
    animateRecipeCards();
});

// Initialiser les fonctionnalités spécifiques à chaque page
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'recipes.html':
            initializeRecipesPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
        case 'about.html':
            initializeAboutPage();
            break;
        default:
            // Page d'accueil ou autres pages
            initializeHomePage();
    }
}

// Fonctionnalités spécifiques à la page des recettes
function initializeRecipesPage() {
    // Filtres de recettes
    const filterBtns = document.querySelectorAll('.filter-btn');
    const recipeCards = document.querySelectorAll('.recipe-card[data-category]');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Enlever la classe active des autres boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterRecipes(filter, recipeCards);
        });
    });
    
    // Pagination
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('next') && !this.classList.contains('prev')) {
                pageButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Filtrer les recettes par catégorie
function filterRecipes(category, cards) {
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardCategories = card.getAttribute('data-category').split(' ');
        
        if (category === 'all' || cardCategories.includes(category)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mettre à jour le compteur
    const countElement = document.getElementById('recipe-count');
    if (countElement) {
        countElement.textContent = visibleCount;
    }
}

// Fonctionnalités spécifiques à la page de contact
function initializeContactPage() {
    // Validation du formulaire de contact
    const form = document.querySelector('.contact-form');
    if (form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Animation des éléments de contact
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300);
    });
}

// Validation d'un champ de formulaire
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Enlever les erreurs précédentes
    clearFieldError(field);
    
    // Validation en fonction du type de champ
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide';
        }
    }
    
    // Afficher l'erreur si nécessaire
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Afficher une erreur sur un champ
function showFieldError(field, message) {
    field.style.borderColor = '#ff6b6b';
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Effacer l'erreur d'un champ
function clearFieldError(field) {
    field.style.borderColor = '#e9ecef';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Soumettre le formulaire de contact
function submitContactForm() {
    const form = document.querySelector('.contact-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    
    // Valider tous les champs
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (isFormValid) {
        // Simuler l'envoi du formulaire
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Message envoyé avec succès! Nous vous répondrons bientôt.');
            
            // Réinitialiser le formulaire
            inputs.forEach(input => {
                input.value = '';
                clearFieldError(input);
            });
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    } else {
        alert('Veuillez corriger les erreurs dans le formulaire.');
    }
}

// Fonctionnalités spécifiques à la page À propos
function initializeAboutPage() {
    // Animation des membres de l'équipe
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        member.style.opacity = '0';
        member.style.transform = 'translateY(30px)';
        member.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            member.style.opacity = '1';
            member.style.transform = 'translateY(0)';
        }, 500);
    });
}

// Fonctionnalités spécifiques à la page d'accueil
function initializeHomePage() {
    // Animations supplémentaires pour la page d'accueil
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(20px)';
        hero.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            hero.style.opacity = '1';
            hero.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Smooth scrolling pour navigation
function initializeSmoothScrolling() {
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

// Search functionality
function initializeSearch() {
    // Sera initialisé par components.js
}

// Recipe card interactions
function initializeRecipeCards() {
    const recipeCards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    recipeCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3, h4');
            if (title) {
                showRecipeDetails(title.textContent);
            }
        });

        // Add hover effect for better user experience
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Show recipe details (placeholder function)
function showRecipeDetails(recipeName) {
    const modal = createRecipeModal(recipeName);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 100);
}

// Create recipe modal
function createRecipeModal(recipeName) {
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
    
    // Add hover effects for buttons
    const buttons = modalContent.querySelectorAll('.modal-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (this.classList.contains('view-recipe')) {
                this.style.backgroundColor = '#ff5252';
            } else {
                this.style.backgroundColor = '#5a6268';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (this.classList.contains('view-recipe')) {
                this.style.backgroundColor = '#ff6b6b';
            } else {
                this.style.backgroundColor = '#6c757d';
            }
        });
    });
    
    // Close modal functionality
    const closeBtn = modalContent.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // View recipe functionality
    const viewBtn = modalContent.querySelector('.view-recipe');
    viewBtn.addEventListener('click', () => {
        alert(`Ouverture de la recette complète pour: ${recipeName}\n\nCeci naviguerait normalement vers une page de recette détaillée.`);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    modal.appendChild(modalContent);
    return modal;
}

// Create scroll-to-top button
function createScrollToTopButton() {
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
    
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'scale(1.1)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide scroll button based on scroll position
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

// Implement lazy loading for images
function implementLazyLoading() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Animate recipe cards on scroll
function animateRecipeCards() {
    const cards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        cardObserver.observe(card);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { 
            opacity: 0; 
            transform: translateY(20px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .recipe-card, .category-card, .pick-card {
        position: relative;
    }
    
    .field-error {
        animation: fadeIn 0.3s ease;
    }
    
    /* Styles pour les boutons de filtre */
    .filter-btn {
        position: relative;
        overflow: hidden;
    }
    
    .filter-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s ease;
    }
    
    .filter-btn:hover::before {
        left: 100%;
    }
`;
document.head.appendChild(style);

// Exposer la fonction submitContactForm globalement
window.submitContactForm = submitContactForm;// Recipe Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav a, .footer-nav a, .footer-secondary a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal anchor links
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

    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', function() {
        const searchTerm = prompt('What recipe would you like to search for?');
        
        if (searchTerm) {
            searchRecipes(searchTerm);
        }
    });

    // Recipe card interactions
    const recipeCards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    recipeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Get the recipe name from the h3 or h4 element
            const title = this.querySelector('h3, h4');
            if (title) {
                showRecipeDetails(title.textContent);
            }
        });

        // Add hover effect for better user experience
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Scroll-to-top functionality
    createScrollToTopButton();

    // Lazy loading for images
    implementLazyLoading();

    // Add loading animation for recipe cards
    animateRecipeCards();
});

// Search functionality
function searchRecipes(searchTerm) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    let foundRecipes = [];
    
    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) {
            foundRecipes.push(card);
        }
    });
    
    if (foundRecipes.length > 0) {
        // Scroll to first found recipe
        foundRecipes[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Highlight found recipes
        foundRecipes.forEach(card => {
            card.style.border = '3px solid #ff6b6b';
            setTimeout(() => {
                card.style.border = '';
            }, 3000);
        });
        
        alert(`Found ${foundRecipes.length} recipe(s) matching "${searchTerm}"`);
    } else {
        alert(`No recipes found for "${searchTerm}". Try a different search term.`);
    }
}

// Show recipe details (placeholder function)
function showRecipeDetails(recipeName) {
    // This would typically open a modal or navigate to a recipe detail page
    const modal = createRecipeModal(recipeName);
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 100);
}

// Create recipe modal
function createRecipeModal(recipeName) {
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
            This is a placeholder for the full recipe details. In a real application, 
            this would show ingredients, instructions, cooking time, and nutritional information.
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
            ">View Full Recipe</button>
            <button class="modal-btn close-modal" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.3s ease;
            ">Close</button>
        </div>
    `;
    
    // Add hover effects for buttons
    const buttons = modalContent.querySelectorAll('.modal-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (this.classList.contains('view-recipe')) {
                this.style.backgroundColor = '#ff5252';
            } else {
                this.style.backgroundColor = '#5a6268';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (this.classList.contains('view-recipe')) {
                this.style.backgroundColor = '#ff6b6b';
            } else {
                this.style.backgroundColor = '#6c757d';
            }
        });
    });
    
    // Close modal functionality
    const closeBtn = modalContent.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // View recipe functionality
    const viewBtn = modalContent.querySelector('.view-recipe');
    viewBtn.addEventListener('click', () => {
        alert(`Opening full recipe for: ${recipeName}\n\nThis would typically navigate to a detailed recipe page.`);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    modal.appendChild(modalContent);
    return modal;
}

// Create scroll-to-top button
function createScrollToTopButton() {
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
    
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'scale(1.1)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide scroll button based on scroll position
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

// Implement lazy loading for images
function implementLazyLoading() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Animate recipe cards on scroll
function animateRecipeCards() {
    const cards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        cardObserver.observe(card);
    });
}

// Filter recipes by category
function filterRecipesByCategory(category) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (category === 'all' || 
            title.includes(category.toLowerCase()) || 
            description.includes(category.toLowerCase())) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add favorite functionality
function toggleFavorite(recipeElement) {
    const favoriteBtn = recipeElement.querySelector('.favorite-btn') || createFavoriteButton();
    
    if (!recipeElement.querySelector('.favorite-btn')) {
        recipeElement.appendChild(favoriteBtn);
    }
    
    const isFavorite = favoriteBtn.classList.contains('favorited');
    
    if (isFavorite) {
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.innerHTML = '♡';
        favoriteBtn.style.color = '#ccc';
    } else {
        favoriteBtn.classList.add('favorited');
        favoriteBtn.innerHTML = '♥';
        favoriteBtn.style.color = '#ff6b6b';
    }
    
    // Store in localStorage (if available)
    try {
        const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        const recipeName = recipeElement.querySelector('h3, h4').textContent;
        
        if (isFavorite) {
            const index = favorites.indexOf(recipeName);
            if (index > -1) favorites.splice(index, 1);
        } else {
            favorites.push(recipeName);
        }
        
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    } catch (e) {
        // Handle case where localStorage is not available
        console.log('LocalStorage not available, favorites not saved');
    }
}

function createFavoriteButton() {
    const btn = document.createElement('button');
    btn.className = 'favorite-btn';
    btn.innerHTML = '♡';
    btn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        font-size: 18px;
        color: #ccc;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.closest('.recipe-card, .category-card, .pick-card'));
    });
    
    return btn;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .recipe-card, .category-card, .pick-card {
        position: relative;
    }
    
    .favorite-btn:hover {
        transform: scale(1.1);
        background: rgba(255, 255, 255, 1);
    }
`;
document.head.appendChild(style);

// Initialize favorite buttons on page load
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.recipe-card, .category-card, .pick-card');
    
    cards.forEach(card => {
        const favoriteBtn = createFavoriteButton();
        card.appendChild(favoriteBtn);
        
        // Load saved favorites
        try {
            const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
            const recipeName = card.querySelector('h3, h4').textContent;
            
            if (favorites.includes(recipeName)) {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '♥';
                favoriteBtn.style.color = '#ff6b6b';
            }
        } catch (e) {
            // Handle case where localStorage is not available
        }
    });
});