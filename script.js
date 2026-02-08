// ============================================================
// R. Pharma Exports - Professional E-Commerce Platform
// Modern, Modular JavaScript Architecture
// ============================================================

/**
 * Product Manager Module
 * Handles product data loading and management
 */
const ProductManager = (() => {
    let products = [];

    /**
     * Fetch and cache products from JSON
     */
    const loadProducts = async () => {
        try {
            // Resolve JSON path relative to the current page so pages inside
            // the `products/` folder fetch the local `products.json` file
            const productsPath = window.location.pathname.includes('/products/')
                ? 'products.json'
                : 'products/products.json';

            const response = await fetch(productsPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            console.log(`✓ Loaded ${products.length} products`);
            return products;
        } catch (error) {
            console.error('Failed to load products:', error);
            return [];
        }
    };

    /**
     * Get all products
     */
    const getAll = () => products;

    /**
     * Get product by ID
     */
    const getById = (id) => products.find(p => p.id === parseInt(id));

    /**
     * Get featured products (first 6)
     */
    const getFeatured = (count = 6) => products.slice(0, count);

    /**
     * Search products by name or description
     */
    const search = (query) => {
        const q = query.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    };

    return {
        loadProducts,
        getAll,
        getById,
        getFeatured,
        search
    };
})();

/**
 * UI Manager Module
 * Handles all DOM interactions and rendering
 */
const UIManager = (() => {
    /**
     * Create product card HTML
     */
    const createProductCard = (product) => {
        return `
            <div class="product-card" role="listitem">
                <div class="product-image product-image-carousel" data-folder="${encodeURIComponent(product.icon || '')}"></div>
                <div class="product-info">
                    <span class="product-category">${product.category || 'Medicine'}</span>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-description">${escapeHtml(product.description)}</p>
                    <div class="product-price">₹${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <a href="products/product-detail.html?id=${product.id}" class="btn btn-sm btn-secondary">View Details</a>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Render featured products
     */
    const displayFeaturedProducts = () => {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        const products = ProductManager.getFeatured();
        container.innerHTML = products.map(createProductCard).join('');
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
        displayFeaturedProducts,
        escapeHtml
    };
})();

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Load products
    await ProductManager.loadProducts();
    
    // Render featured products
    UIManager.displayFeaturedProducts();

    // Initialize auto carousels for product cards and other pages
    Carousel.initAutoCarousels();

    // Active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href').split('/').pop() || 'index.html';
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });

        // close menu when resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) navMenu.classList.remove('open');
        });
    }
});

/* Carousel utilities ------------------------------------------------- */
const Carousel = (() => {
    const MAX_IMAGES = 12;
    const EXTENSIONS = ['jpeg', 'jpg', 'png'];

    // base path when running inside products/ folder
    const basePath = window.location.pathname.includes('/products/') ? '../' : '';

    const loadImage = (url) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });

    async function probeImages(folder) {
        const urls = [];
        if (!folder) return urls;
        const decoded = decodeURIComponent(folder).trim();
        if (!decoded) return urls;
        const encodedFolder = encodeURIComponent(decoded).replace(/%2F/g, '/');

        for (let i = 1; i <= MAX_IMAGES; i++) {
            let found = false;
            for (const ext of EXTENSIONS) {
                const url = `${basePath}${encodedFolder}/${i}.${ext}`;
                // eslint-disable-next-line no-await-in-loop
                const ok = await loadImage(url);
                if (ok) {
                    urls.push(url);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        return urls;
    }

    function create(container, urls = [], opts = {}) {
        const { auto = true, interval = 7000, controls = false } = opts;
        if (!container) return;
        container.innerHTML = '';

        if (!urls || urls.length === 0) {
            container.textContent = '💊';
            container.classList.add('product-image-fallback');
            return;
        }

        const id = `bs-carousel-${Math.random().toString(36).slice(2, 9)}`;
        const carousel = document.createElement('div');
        carousel.className = 'carousel slide';
        carousel.id = id;
        if (auto) carousel.setAttribute('data-bs-ride', 'carousel');
        if (interval) carousel.setAttribute('data-bs-interval', String(interval));

        const inner = document.createElement('div');
        inner.className = 'carousel-inner';

        urls.forEach((u, idx) => {
            const item = document.createElement('div');
            item.className = 'carousel-item' + (idx === 0 ? ' active' : '');
            const img = document.createElement('img');
            img.src = u;
            img.className = 'd-block w-100 carousel-image';
            img.alt = container.getAttribute('aria-label') || 'product image';
            item.appendChild(img);
            inner.appendChild(item);
        });

        carousel.appendChild(inner);

        if (controls) {
            const prev = document.createElement('button');
            prev.className = 'carousel-control-prev';
            prev.type = 'button';
            prev.setAttribute('data-bs-target', `#${id}`);
            prev.setAttribute('data-bs-slide', 'prev');
            prev.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';

            const next = document.createElement('button');
            next.className = 'carousel-control-next';
            next.type = 'button';
            next.setAttribute('data-bs-target', `#${id}`);
            next.setAttribute('data-bs-slide', 'next');
            next.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';

            carousel.appendChild(prev);
            carousel.appendChild(next);
        }

        container.appendChild(carousel);

        // initialize with Bootstrap's Carousel if available
        if (window.bootstrap && window.bootstrap.Carousel) {
            // interval false for manual carousels
            const config = { interval: auto ? interval : false, ride: auto ? 'carousel' : false, touch: false };
            try { new bootstrap.Carousel(carousel, config); } catch (e) { /* ignore */ }
        }

        return carousel;
    }

    async function initAutoCarousels() {
        const nodes = document.querySelectorAll('.product-image-carousel');
        if (!nodes || nodes.length === 0) return;

        await Promise.all(Array.from(nodes).map(async (node) => {
            const folder = node.dataset.folder || '';
            const urls = await probeImages(folder);
            create(node, urls, { auto: true, interval: 7000, controls: false });
        }));
    }

    return { probeImages, create, initAutoCarousels };
})();
