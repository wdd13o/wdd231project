document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let allResources = [];
    let displayedResources = 6;
    const resourcesPerLoad = 4;
    let currentCategory = '';
    let currentType = '';
    let currentSearch = '';

    // Load resources data
    fetch('data/resources.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data.resources || !data.categories) {
                throw new Error('Invalid data format');
            }
            allResources = data.resources;
            populateCategories(data.categories);
            displayResources(allResources);
            setupEventListeners();
            initWowJS();
        })
        .catch(error => {
            console.error('Error loading resources:', error);
            displayError(error.message);
        });

    // Populate category dropdown and category cards
    function populateCategories(categories) {
        const categoryDropdown = document.getElementById('resource-category');
        const categoriesContainer = document.getElementById('categories-container');

        // Clear existing options/cards
        if (!categoryDropdown || !categoriesContainer) {
            console.error('Required DOM elements not found');
            return;
        }

        categoryDropdown.innerHTML = '<option value="">All Categories</option>';
        categoriesContainer.innerHTML = '';

        // Add categories to dropdown
        categories.forEach((category, index) => {
            if (typeof category !== 'string') return;

            // Sanitize category name for image path
            const sanitizedCategory = category.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            // Add to dropdown
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);

            // Create category card
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-lg-3 col-md-6';
            
            // Only add wow classes if WOW.js is expected to be available
            if (typeof WOW !== 'undefined') {
                categoryCard.classList.add('wow', 'fadeInUp');
                categoryCard.dataset.wowDelay = `${0.1 + (index * 0.1)}s`;
            }

            categoryCard.innerHTML = `
                <div class="category-item rounded overflow-hidden">
                    <div class="position-relative">
                        <img class="img-fluid" src="img/categories/${sanitizedCategory}.jpg" alt="${category}" loading="lazy">
                        <div class="category-overlay">
                            <button class="btn btn-sm btn-success category-filter" data-category="${category}" aria-label="View resources in ${category}">
                                View Resources
                            </button>
                        </div>
                    </div>
                    <div class="p-4">
                        <h5 class="mb-1">${category}</h5>
                        <small>${getRandomResourceCount()} resources</small>
                    </div>
                </div>
            `;
            categoriesContainer.appendChild(categoryCard);
        });
    }

    // Display resources with animations
    function displayResources(resources) {
        const resourcesContainer = document.getElementById('resources-container');
        if (!resourcesContainer) return;
        
        // Clear existing resources
        resourcesContainer.innerHTML = resources.length === 0 ? 
            '<div class="col-12 text-center py-5"><p class="text-muted">No resources found matching your criteria.</p></div>' : 
            '';

        // Display resources up to the displayedResources count
        const resourcesToShow = resources.slice(0, displayedResources);
        
        resourcesToShow.forEach((resource, index) => {
            if (!isValidResource(resource)) return;
            
            const resourceCard = createResourceCard(resource, index);
            resourcesContainer.appendChild(resourceCard);
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = displayedResources < resources.length ? 'inline-block' : 'none';
        }
    }

    // Validate resource object
    function isValidResource(resource) {
        return resource && 
               typeof resource === 'object' && 
               resource.title && 
               resource.description && 
               resource.category && 
               resource.type;
    }

    // Create resource card HTML
    function createResourceCard(resource, index) {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6';
        
        // Add WOW.js classes if available
        if (typeof WOW !== 'undefined') {
            card.classList.add('wow', 'fadeInUp');
            card.dataset.wowDelay = `${0.1 + (index % 3) * 0.1}s`;
        }
        
        // Determine icon based on resource type
        const iconMap = {
            'guide': 'fas fa-book',
            'tool': 'fas fa-tools',
            'video': 'fas fa-video',
            'article': 'fas fa-newspaper',
            'book': 'fas fa-book-open',
            'podcast': 'fas fa-podcast'
        };
        const iconClass = iconMap[resource.type] || 'fas fa-leaf';

        // Featured resources get special styling
        const featuredClass = resource.featured ? 'featured-resource' : '';
        const featuredBadge = resource.featured ? 
            '<span class="featured-badge" aria-hidden="true">Featured</span>' : 
            '';

        // Safely format date
        let displayDate;
        try {
            displayDate = formatDate(resource.date);
        } catch (e) {
            console.warn('Invalid date format for resource:', resource.title);
            displayDate = 'Date not available';
        }

        card.innerHTML = `
            <div class="resource-item ${featuredClass} h-100">
                ${featuredBadge}
                <div class="resource-img">
                    <img class="img-fluid" src="${resource.image || 'img/resources/default.jpg'}" alt="${resource.title}" loading="lazy">
                    <div class="resource-overlay">
                        <a class="btn btn-sm btn-success" href="${resource.url || '#'}" target="_blank" rel="noopener noreferrer">
                            View Resource
                        </a>
                    </div>
                </div>
                <div class="p-4">
                    <div class="d-flex justify-content-between mb-3">
                        <span class="badge bg-success">${resource.category}</span>
                        <span class="text-muted"><i class="${iconClass} me-1" aria-hidden="true"></i>${resource.type}</span>
                    </div>
                    <h5 class="mb-2">${resource.title}</h5>
                    <p class="mb-3">${resource.description}</p>
                    <div class="resource-meta d-flex justify-content-between">
                        <small class="text-muted"><i class="fas fa-user me-1" aria-hidden="true"></i>${resource.author || 'Unknown author'}</small>
                        <small class="text-muted"><i class="fas fa-calendar-alt me-1" aria-hidden="true"></i>${displayDate}</small>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    // Set up event listeners for filters and buttons
    function setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('resource-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(e) {
                currentSearch = e.target.value.toLowerCase();
                filterResources();
            }, 300));
        }

        // Category filter
        const categoryFilter = document.getElementById('resource-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function(e) {
                currentCategory = e.target.value;
                filterResources();
            });
        }

        // Type filter
        const typeFilter = document.getElementById('resource-type');
        if (typeFilter) {
            typeFilter.addEventListener('change', function(e) {
                currentType = e.target.value;
                filterResources();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                displayedResources += resourcesPerLoad;
                filterResources();
            });
        }

        // Category buttons (delegated event)
        const categoriesContainer = document.getElementById('categories-container');
        if (categoriesContainer) {
            categoriesContainer.addEventListener('click', function(e) {
                const button = e.target.closest('.category-filter');
                if (button) {
                    currentCategory = button.dataset.category;
                    const categoryDropdown = document.getElementById('resource-category');
                    if (categoryDropdown) {
                        categoryDropdown.value = currentCategory;
                    }
                    filterResources();
                    
                    // Scroll to resources section
                    const resourcesContainer = document.getElementById('resources-container');
                    if (resourcesContainer) {
                        resourcesContainer.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    }

    // Simple debounce function
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // Filter resources based on current filters
    function filterResources() {
        displayedResources = 6; // Reset to initial count when filters change
        
        let filtered = allResources.filter(resource => {
            if (!isValidResource(resource)) return false;
            
            const matchesSearch = currentSearch === '' || 
                (resource.title && resource.title.toLowerCase().includes(currentSearch)) || 
                (resource.description && resource.description.toLowerCase().includes(currentSearch)) ||
                (resource.author && resource.author.toLowerCase().includes(currentSearch));
            
            const matchesCategory = currentCategory === '' || resource.category === currentCategory;
            const matchesType = currentType === '' || resource.type === currentType;
            
            return matchesSearch && matchesCategory && matchesType;
        });

        displayResources(filtered);
    }

    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return 'Date not available';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // Helper function to generate random resource count for categories
    function getRandomResourceCount() {
        return Math.floor(Math.random() * 15) + 5;
    }

    // Initialize WOW.js for animations if available
    function initWowJS() {
        if (typeof WOW === 'function') {
            try {
                new WOW().init();
            } catch (e) {
                console.warn('Failed to initialize WOW.js:', e);
            }
        }
    }

    // Display error message if resources fail to load
    function displayError(message = '') {
        const container = document.getElementById('resources-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-warning mb-3" style="font-size: 3rem;" aria-hidden="true">⚠️</div>
                <h4 class="mb-3">Error Loading Resources</h4>
                ${message ? `<p class="text-muted">${message}</p>` : ''}
                <button class="btn btn-success" id="reload-button">
                    <span class="me-2" aria-hidden="true">↻</span>
                    Try Again
                </button>
            </div>
        `;
        
        // Add proper event listener instead of onclick
        const reloadButton = document.getElementById('reload-button');
        if (reloadButton) {
            reloadButton.addEventListener('click', function() {
                window.location.reload();
            });
        }
    }
});