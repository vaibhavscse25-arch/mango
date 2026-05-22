document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Checkout & Modal Functionality
    const buyNowBtns = document.querySelectorAll('.buy-now-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const successModal = document.getElementById('success-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    // Form elements
    const orderForm = document.getElementById('order-form');
    const paymentRadios = document.getElementsByName('payment-method');
    const upiDetails = document.getElementById('upi-details');
    const modalProductTitle = document.getElementById('modal-product-title');
    const modalProductPrice = document.getElementById('modal-product-price');
    
    // Open Checkout Modal
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Get product info from DOM
            const productCard = e.target.closest('.product-card');
            const title = productCard.querySelector('.product-title').textContent;
            const price = productCard.querySelector('.price').textContent;
            
            // Set modal info
            modalProductTitle.textContent = `Checkout: ${title}`;
            modalProductPrice.textContent = `Price: ${price} per box`;
            
            // Store data for email
            orderForm.dataset.productTitle = title;
            orderForm.dataset.productPrice = price;
            
            checkoutModal.classList.add('show');
        });
    });

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            checkoutModal.classList.remove('show');
            successModal.classList.remove('show');
        });
    });

    // Close on outside click
    window.addEventListener('click', (event) => {
        if (event.target === checkoutModal) checkoutModal.classList.remove('show');
        if (event.target === successModal) successModal.classList.remove('show');
    });
    
    // Geolocation - Live Location
    const getLocationBtn = document.getElementById('get-location-btn');
    const addressField = document.getElementById('customer-address');

    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            getLocationBtn.textContent = '📍 Locating (Please wait)...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                    
                    // Try reverse geocoding via free Nominatim API
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(res => res.json())
                        .then(data => {
                            if(data && data.display_name) {
                                addressField.value = `${data.display_name}\n\nMaps Link: ${mapsLink}`;
                            } else {
                                addressField.value = `Live Location: ${mapsLink}`;
                            }
                            getLocationBtn.textContent = '✅ Location Added';
                        })
                        .catch(() => {
                            addressField.value = `Live Location: ${mapsLink}`;
                            getLocationBtn.textContent = '✅ Location Added';
                        });
                },
                (error) => {
                    alert('Could not get your exact location. Please type it manually.');
                    getLocationBtn.textContent = '📍 Use Live Location';
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    // Toggle Payment Method view
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'UPI') {
                upiDetails.style.display = 'block';
            } else {
                upiDetails.style.display = 'none';
            }
        });
    });
    
    // Handle Form Submit
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = orderForm.querySelector('.submit-order-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.textContent = 'Processing Order...';
        submitBtn.disabled = true;

        // Get form values
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const address = document.getElementById('customer-address').value;
        const quantity = document.getElementById('order-quantity').value;
        
        // Get selected payment method
        let paymentMethod = 'UPI';
        paymentRadios.forEach(radio => {
            if (radio.checked) paymentMethod = radio.value;
        });
        
        const productTitle = orderForm.dataset.productTitle;
        const productPrice = orderForm.dataset.productPrice;
        
        // Construct Order Message
        let orderMessage = `*New Mango Order!*\n\n`;
        orderMessage += `*Product:* ${productTitle}\n`;
        orderMessage += `*Price:* ${productPrice}\n`;
        orderMessage += `*Quantity:* ${quantity} Box(es)\n`;
        orderMessage += `*Payment Method:* ${paymentMethod}\n\n`;
        orderMessage += `*Customer Details:*\n`;
        orderMessage += `Name: ${name}\n`;
        orderMessage += `Phone: ${phone}\n`;
        orderMessage += `Address: ${address}\n\n`;
        
        if (paymentMethod === 'UPI') {
            orderMessage += `Note: I will send the payment screenshot shortly.`;
        } else {
            orderMessage += `Note: I have selected Cash on Delivery.`;
        }

        // Redirect to WhatsApp with pre-filled message (Fallback to SMS if preferred, but WA is standard for business)
        // Number provided by user: 7057857174
        const whatsappUrl = `https://wa.me/917057857174?text=${encodeURIComponent(orderMessage)}`;
        
        // Show success modal
        checkoutModal.classList.remove('show');
        successModal.classList.add('show');
        
        // Reset form
        orderForm.reset();
        upiDetails.style.display = 'block'; // Reset to default UPI view
        getLocationBtn.textContent = '📍 Use Live Location';
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Open WhatsApp in a new tab to send the message
        window.open(whatsappUrl, '_blank');
    });
});
