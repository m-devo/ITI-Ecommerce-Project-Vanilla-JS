import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { createOrder } from "../../data/orders.js";


const auth = getAuth();

let uid = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../auth/login.html";
    } else {
        user = user.uid;
    }
});


//  Bootstrap validation ---
(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})();

//  Stripe
const stripe = Stripe('pk_test_51S4ZiFAIqybw8yVGopD7R32Gwo0KnpBvPBXo7yIk0zuPYuq98zEw3mo2SipmjhoAMNbbcjQ0KF2Z1eygIQSATtmQ00G0fwh5w6');


let itemsController = document.getElementById('items-controller');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

let total = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0) + 50;

let numberOfItems = cart.reduce((acc, item) => acc + item.quantity, 0);

let itemsBadge = document.getElementById('itemsBadge');

itemsBadge.textContent = numberOfItems;

let checkoutBtn = document.getElementById('checkout-btn');
checkoutBtn.textContent = `Pay Now $${total.toFixed(2)}`;




if (cart.length > 0) {
    cart.forEach(item => {
        let itemHtml = `
            <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <h6 class="my-1">${item.name}</h6>

                        <small class="text-muted d-block">Quantity: ${item.quantity}</small>
                        <small class="text-muted">Item Price: ${item.price}$</small>
                    </div>
                    <span class="text-muted">${item.price.toFixed(2) * item.quantity}$</span>
                </li>
            </ul>
        `;
        itemsController.innerHTML += itemHtml;
    });

    let totalHtml = `
        <ul class="list-group list-group-flush active">
            <li class="list-group-item d-flex justify-content-between lh-sm">
                <div>
                    <h6 class="my-0">Shipping</h6>
                </div>
                <span class="text-primary">$50.00$</span>
            </li>
        </ul>
        <ul class="list-group list-group-flush active">
            <li class="list-group-item d-flex justify-content-between lh-sm">
                <div>
                    <h6 class="my-0">Total</h6>
                </div>
                <span class="text-primary active">${total.toFixed(2)}$</span>
            </li>
        </ul>
    `;
    itemsController.innerHTML += totalHtml;
} else {
    window.location.href = '../../index.html';
}



const elements = stripe.elements();
const cardElement = elements.create('card', {
    style: {
        base: {
            color: '#32325d',
            fontFamily: 'Inter, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
});
        
cardElement.mount('#card-element');


// errors 
const cardErrors = document.getElementById('card-errors');
cardElement.on('change', function(event) {
    if (event.error) {
        cardErrors.textContent = event.error.message;
    } else {
        cardErrors.textContent = '';
    }
});

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const spinner = document.getElementById('spinner');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Trigger Bootstrap validation
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
        return;
    }

    const address = document.getElementById('address').value;
    
    // Disable button and show spinner
    submitButton.disabled = true;
    spinner.classList.remove('d-none');
    checkoutBtn.textContent = 'Processing...';

    // Create payment method with Stripe

    try {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                'address': address,
                'user_id': uid
            },
        });

        await createOrder(cart, total, address, paymentMethod);

        localStorage.removeItem('cart');

        window.location.href = `../orders/orders.html?payment=success`;

    } catch (orderError) {
            console.error("Failed to create order:", orderError);
            cardErrors.textContent = "Could not save your order. Please try again.";

            submitButton.disabled = false;
            spinner.classList.add('d-none');
            checkoutBtn.textContent = `Pay Now $${total.toFixed(2)}`;
    }

});





