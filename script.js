// Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem('kixxCart')) || [];

// Product data
const product = {
    id: 'kixx-square',
    name: 'KiXX Square',
    price: 199.99,
    image: 'images/branding/Kixx_web_blue.png'
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Contact form submission (now handled by Formspree)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Scroll Animation Logic
    const animatedElements = document.querySelectorAll('.fade-in-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
});

// Add to cart function
function addToCart() {
    // Get the button that was clicked (if available)
    const button = event?.target;
    
    // Show loading state
    if (button) {
        button.classList.add('loading');
        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        
        // Simulate brief delay for better UX
        setTimeout(() => {
            completeAddToCart(button, originalText);
        }, 300);
    } else {
        completeAddToCart();
    }
}

function completeAddToCart(button = null, originalText = '') {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('kixxCart', JSON.stringify(cart));
    updateCartCount();
    
    // Reset button state
    if (button) {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = '✓ Added to Cart!';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    } else {
        // Fallback alert if no button reference
        alert('KiXX Square added to cart!');
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCounts = document.querySelectorAll('#cartCount, .btn-cart');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCounts.forEach(element => {
        if (element.id === 'cartCount') {
            element.textContent = totalItems;
        } else if (element.classList.contains('btn-cart')) {
            element.textContent = `Cart (${totalItems})`;
        }
    });
}

// Display cart items
function displayCart() {
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContent = document.getElementById('cartContent');
    const cartItemsList = document.getElementById('cartItemsList');
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';
    
    // Build cart items HTML
    let cartHTML = '';
    cart.forEach(item => {
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button onclick="updateQuantity('${item.id}', -1)" class="qty-btn">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="qty-btn">+</button>
                </div>
                <div class="item-total">
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="remove-btn remove-btn-icon"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = cartHTML;
    updateCartSummary();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        
        localStorage.setItem('kixxCart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('kixxCart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax estimate
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Proceed to checkout
async function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Show loading state
    const checkoutBtn = event.target;
    checkoutBtn.classList.add('loading');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';
    
    try {
        // Call Netlify Function to create Stripe checkout session
        // This URL will work automatically when deployed to Netlify
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart,
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.origin + '/cart.html'
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        // Initialize Stripe with your publishable key
        const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your checkout. Please try again or contact support.');
    } finally {
        // Reset button state
        checkoutBtn.classList.remove('loading');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Checkout';
    }
}

// Handle contact form submission (Formspree)
function handleContactSubmit(e) {
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('formMessage');
    
    // Show loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
    }
    
    // Formspree will handle the actual submission
    // This just provides user feedback
    
    // Note: After Formspree processes the form, it will either:
    // 1. Show their default thank you page, or
    // 2. Return to this page if you configure a redirect in Formspree
    
    // For AJAX submission (optional - keeps user on page):
    // Uncomment this to submit via AJAX instead:
    /*
    e.preventDefault();
    
    fetch(e.target.action, {
        method: 'POST',
        body: new FormData(e.target),
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            messageDiv.innerHTML = '<p class="success-message">✓ Thank you! We\'ll get back to you within 24 hours.</p>';
            messageDiv.style.display = 'block';
            e.target.reset();
        } else {
            throw new Error('Form submission failed');
        }
    }).catch(error => {
        messageDiv.innerHTML = '<p class="error-message">Oops! There was a problem. Please try again or email us directly.</p>';
        messageDiv.style.display = 'block';
    }).finally(() => {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
    */
}

// Product image gallery - change main image on thumbnail click
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
        
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.style.borderColor = 'transparent';
        });
        
        // Add active class to clicked thumbnail
        event.target.style.borderColor = 'var(--gold)';
    }
}

// Smooth scrolling for anchor links
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

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current FAQ
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
});

// Drawer Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const moreBtn = document.getElementById('moreMenuBtn');
    const drawerMenu = document.getElementById('drawerMenu');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');

    function openDrawer() {
        drawerMenu.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeDrawer() {
        drawerMenu.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Open drawer when More button is clicked
    if (moreBtn) {
        moreBtn.addEventListener('click', openDrawer);
    }

    // Close drawer when close button is clicked
    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }

    // Close drawer when overlay is clicked
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }

    // Close drawer on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawerMenu.classList.contains('active')) {
            closeDrawer();
        }
    });
});
