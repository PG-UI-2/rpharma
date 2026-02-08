// ============================================================
// Products Page Module
// Advanced filtering, sorting, and display functionality
// ============================================================

const ProductsPage = (() => {
    let allProducts = [];
    let filteredProducts = [];

    const filters = {
        search: '',
        category: '',
        maxPrice: 250,
        sortBy: 'name'
    };

    /**
     * Initialize the products page
     */
    const init = async () => {
        allProducts = await ProductManager.loadProducts();
        filteredProducts = [...allProducts];

        setupEventListeners();
        applyFilters();
        updateUI();
    };

    /**
     * Setup all event listeners
     */
    const setupEventListeners = () => {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filters.search = e.target.value;
                applyFilters();
                updateUI();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                filters.category = e.target.value;
                applyFilters();
                updateUI();
            });
        }

        // Price range filter
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                filters.maxPrice = parseInt(e.target.value);
                document.getElementById('priceValue').textContent = filters.maxPrice;
                applyFilters();
                updateUI();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                filters.sortBy = e.target.value;
                applyFilters();
                updateUI();
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllFilters);
        }

        // Reset filters button
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', clearAllFilters);
        }
    };

    /**
     * Apply all filters and sorting
     */
    const applyFilters = () => {
        filteredProducts = allProducts.filter(product => {
            // Search filter
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const matchSearch = product.name.toLowerCase().includes(q) ||
                                  product.description.toLowerCase().includes(q);
                if (!matchSearch) return false;
            }

            // Category filter
            if (filters.category && product.category !== filters.category) {
                return false;
            }

            // Price filter
            if (product.price > filters.maxPrice) {
                return false;
            }

            return true;
        });

        // Apply sorting
        applySort();
    };

    /**
     * Apply sorting to filtered products
     */
    const applySort = () => {
        const sorted = [...filteredProducts];

        switch (filters.sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name':
            default:
                sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        filteredProducts = sorted;
    };

    /**
     * Clear all filters
     */
    const clearAllFilters = () => {
        filters.search = '';
        filters.category = '';
        filters.maxPrice = 250;
        filters.sortBy = 'name';

        // Update UI elements
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = '';

        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.value = '250';
            document.getElementById('priceValue').textContent = '250';
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.value = 'name';

        applyFilters();
        updateUI();
    };

    /**
     * Update UI with current filtered products
     */
    const updateUI = () => {
        displayProducts(filteredProducts);
        updateProductCount();
        updateNoResultsMessage();
    };

    /**
     * Display products with enhanced cards
     */
    const displayProducts = (productsToDisplay) => {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (productsToDisplay.length === 0) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = productsToDisplay.map(product => createProductCard(product)).join('');

        // Initialize auto carousels for product cards (autoplay listing)
        // use a microtask so DOM is updated before initialization
        Promise.resolve().then(() => {
            if (typeof Carousel !== 'undefined' && typeof Carousel.initAutoCarousels === 'function') {
                Carousel.initAutoCarousels();
            }
        });
    };

    /**
     * Create enhanced product card HTML
     */
    const createProductCard = (product) => {
        return `
            <div class="product-card" role="listitem">
                <div class="product-image product-image-carousel" data-folder="${encodeURIComponent(product.icon || '')}"></div>
                <div class="product-info">
                    <span class="product-category">${escapeHtml(product.category || 'Medicine')}</span>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-description">${escapeHtml(product.description)}</p>
                    <div class="product-price">₹${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-secondary">Details</a>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Update product count display
     */
    const updateProductCount = () => {
        const countElement = document.getElementById('productsCount');
        if (countElement) {
            countElement.textContent = filteredProducts.length;
        }
    };

    /**
     * Show/hide no results message
     */
    const updateNoResultsMessage = () => {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = filteredProducts.length === 0 ? 'block' : 'none';
        }
    };

    /**
     * Escape HTML to prevent XSS
     */
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    return {
        init
    };
})();

/**
 * Initialize page on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    ProductsPage.init();
});

// Filter products by category
function filterProducts(category) {
    const allCheckbox = document.querySelector('input[value="all"]');
    const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');

    if (category === 'all') {
        checkboxes.forEach(cb => cb.checked = cb.value === 'all');
        currentFilter = 'all';
    } else {
        allCheckbox.checked = false;
    }

    const selectedCategories = Array.from(checkboxes)
        .filter(cb => cb.checked && cb.value !== 'all')
        .map(cb => cb.value);

    if (selectedCategories.length === 0) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(p => selectedCategories.includes(p.category));
    }

    applyFilters();
}

// Filter by price
function filterByPrice(value) {
    maxPrice = value;
    document.getElementById('priceValue').textContent = value;
    applyFilters();
}

// Apply all filters and sorting
function applyFilters() {
    let result = filteredProducts.filter(p => p.price <= maxPrice);

    // Apply sorting
    switch (currentSort) {
        case 'name':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
    }

    displayProducts(result);
}

// Sort products
function sortProducts(sortType) {
    currentSort = sortType;
    applyFilters();
}

// Styles for products page specific elements
const style = document.createElement('style');
style.textContent = `
    .page-header {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 3rem 0;
        text-align: center;
        margin-top: 60px;
    }

    .page-header h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    .page-header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }

    .products-section {
        padding: 3rem 0;
        min-height: calc(100vh - 400px);
    }

    .products-container {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
    }

    .filters-sidebar {
        background-color: var(--light-bg);
        padding: 1.5rem;
        border-radius: 8px;
        height: fit-content;
        position: sticky;
        top: 100px;
    }

    .filters-sidebar h3 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--text-color);
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .filter-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.95rem;
    }

    .filter-group input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .filters-sidebar select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 0.95rem;
    }

    .filters-sidebar input[type="range"] {
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .filters-sidebar p {
        font-size: 0.9rem;
        color: #666;
    }

    .products-main {
        min-height: 400px;
    }

    @media (max-width: 768px) {
        .products-container {
            grid-template-columns: 1fr;
        }

        .filters-sidebar {
            position: static;
            margin-bottom: 2rem;
        }

        .page-header h1 {
            font-size: 1.8rem;
        }
    }
`;
document.head.appendChild(style);
