// get login user 

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

let checkoutBtn = document.getElementById("checkout-btn");
let loginMessage = document.getElementById("loginMessage");



const auth = getAuth();

let cart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];


onAuthStateChanged(auth, (user) => {
    if (user) {

        checkoutBtn.addEventListener("click", function () {
        window.location.href = "../checkout/checkout.html";
    });
    } else {
        checkoutBtn.disabled = true;

        loginMessage.style.display = "block";
    }
});


if (cart.length < 1) {
    checkoutBtn.disabled = true;
}
