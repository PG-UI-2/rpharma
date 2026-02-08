// ============================================================
// Product Detail Page Module
// Professional product information display and management
// ============================================================

const ProductDetailPage = (() => {
    let currentProduct = null;
    let allProducts = [];

    /**
     * Initialize the product detail page
     */
    const init = async () => {
        allProducts = await ProductManager.loadProducts();
        
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (productId) {
            currentProduct = ProductManager.getById(productId);
            if (currentProduct) {
                displayProductDetail();
                displayRelatedProducts();
                updatePageMeta();
            } else {
                showErrorMessage('Product not found');
            }
        } else {
            showErrorMessage('No product specified');
        }
    };

    /**
     * Display product detail information
     */
    const displayProductDetail = () => {
        const container = document.getElementById('productDetail');
        const product = currentProduct;
        const detailHTML = `
            <div class="product-detail-grid">
                <div class="product-detail-image product-detail-carousel" data-folder="${encodeURIComponent(product.icon || '')}">
                </div>

                <div class="product-detail-info">
                    <h1>${escapeHtml(product.name)}</h1>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">Category</span>
                            <span class="meta-value" style="text-transform: capitalize;">${escapeHtml(product.category || 'Medicine')}</span>
                        </div>
                    </div>

                    <p class="product-description-full">
                        ${escapeHtml(product.description)}
                    </p>

                    <div class="product-features">
                        <h3>Key Information</h3>
                        <p>${escapeHtml(product.details)}</p>
                    </div>

                    <div class="product-price-display">
                        ₹${product.price.toFixed(2)}
                    </div>

                    <div class="action-buttons">
                        <a href="index.html" class="btn btn-primary btn-lg">Browse More Products</a>
                        <a href="../contact/index.html" class="btn btn-secondary btn-lg">Inquire Now</a>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = detailHTML;

        // Initialize main product manual carousel (user-controlled)
        (async () => {
            try {
                const carouselContainer = container.querySelector('.product-detail-carousel');
                if (carouselContainer) {
                    const urls = await Carousel.probeImages(carouselContainer.dataset.folder || '');
                    Carousel.create(carouselContainer, urls, { auto: false, controls: true, interval: 5000 });
                }
            } catch (e) {
                // ignore
            }
        })();
    };

    /**
     * Display related products
     */
    const displayRelatedProducts = () => {
        const container = document.getElementById('relatedProducts');
        const product = currentProduct;

        const related = allProducts
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);

        if (related.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">No related products found.</p>';
            return;
        }

        container.innerHTML = related.map(p => `
            <div class="product-card" role="listitem">
                <div class="product-image product-image-carousel" data-folder="${encodeURIComponent(p.icon || '')}"></div>
                <div class="product-info">
                    <span class="product-category">${escapeHtml(p.category || 'Medicine')}</span>
                    <h3 class="product-name">${escapeHtml(p.name)}</h3>
                    <p class="product-description">${escapeHtml(p.description)}</p>
                    <div class="product-price">₹${p.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <a href="product-detail.html?id=${p.id}" class="btn btn-sm btn-secondary">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize auto carousels for related products (uncontrollable by user)
        (async () => {
            try {
                const nodes = container.querySelectorAll('.product-image-carousel');
                await Promise.all(Array.from(nodes).map(async (node) => {
                    const urls = await Carousel.probeImages(node.dataset.folder || '');
                    Carousel.create(node, urls, { auto: true, interval: 5000, controls: false });
                }));
            } catch (e) {
                // ignore
            }
        })();
    };

    /**
     * Update page meta tags
     */
    const updatePageMeta = () => {
        const product = currentProduct;
        
        // Update page title
        document.title = `${product.name} - R. Pharma Exports | Professional Healthcare Solutions`;
        
        // Update breadcrumb
        document.getElementById('breadcrumbProduct').textContent = product.name;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', `${product.name} - ${product.description}. Professional pharmaceutical product from R. Pharma Exports.`);
        }
    };

    /**
     * Show error message
     */
    const showErrorMessage = (message) => {
        const container = document.getElementById('productDetail');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--bg-light); border-radius: var(--radius-lg);">
                <h2 style="color: var(--text-primary); margin-bottom: 1rem;">⚠️ ${message}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">The product you're looking for could not be found.</p>
                <a href="index.html" class="btn btn-primary">Browse All Products</a>
            </div>
        `;
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
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    ProductDetailPage.init();
});
