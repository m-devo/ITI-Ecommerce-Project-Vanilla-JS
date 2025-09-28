import { brandName, paths , homePath , basePath} from "../config/main.js";

import { auth, db, storage } from '../assets/js/firebase-config.js';

import { syncCartOnLogin} from '../data/cart.js';

import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

console.log(paths);

class MainNavbar extends HTMLElement {
    
    connectedCallback() {

        let currentCart = JSON.parse(localStorage.getItem("cart")) || [];

        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        const activeLink = this.getAttribute("active-link") ? this.getAttribute("active-link").toLowerCase() : '';

        const navItemsHTML = paths.map(path => `
            <li class="nav-item">
                <a class="nav-link ${activeLink === path.label.toLowerCase() ? "active" : ""}" href="${path.path}" aria-current="page">
                    ${path.label} ${path.icon || ""}
                </a>
            </li>
        `).join("");


        this.innerHTML = `
            <nav class="navbar navbar-expand-lg bg-transparent fixed-top" role="navigation">
                <div class="container">
                    <a class="navbar-brand active" href="${homePath}">${brandName}</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                            ${navItemsHTML}
                        </ul>
                    </div>

                    <div class="dropdown mx-1">
                    <button class="btn btn-primary dropdown-toggle dropdown-account" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    </button>
                    <ul class="dropdown-menu dropdown-menu-account">
                    </ul>
                    </div>

                </div>
            </nav>
        `;

        let accountDropdown = document.querySelector(".dropdown-account");
        let accountDropdownMenu = document.querySelector(".dropdown-menu-account");


        (function updateCartUI() {
            const cartCount = currentCart.reduce(
                (total, item) => total + item.quantity,
                0
            );

            const cartLink = document.querySelector('.navbar .nav-link[href*="cart"]');
            if (cartLink) {
                cartLink.innerHTML = `Cart (${cartCount}) <i class="fas fa-shopping-cart"></i>`;
            }
        })();

        (function updateWishlistCount() {
            const count = wishlist.length;
            const countEl = document.getElementById("wishlist-count");
            if (countEl)
                countEl.innerHTML = `<i class="fas fa-heart me-2"></i>${count} ${
                count === 1 ? "item" : "items"
                }`;

            const navWishlist = document.querySelector(
                '.navbar .nav-link[href*="wishlist"]'
            );
            if (navWishlist) {
                const icon = '<i class="fas fa-heart"></i>';
                navWishlist.innerHTML = `Wishlist (${count}) ${icon}`;
            }
        })();


        onAuthStateChanged(auth, async (user) => {
            if (user) {

                console.log("user", user);

                await syncCartOnLogin(user.uid);

                

                
                // accountDropdown.innerHTML = user.first_name;
                
                
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    console.log("data", data.fname);
                    
                    const adminLink = data.role.toLowerCase() === "admin" ?
                            `<li><a class="dropdown-item" href="${basePath}/pages/admin/admin-dashboard.html">Admin</a></li>` : "";
                    
                            
                            
                            accountDropdown.innerHTML = data.fname ?? data.first_name;
                            accountDropdownMenu.innerHTML = `
                            <li><a class="dropdown-item" href="${basePath}/pages/profile/profile.html">Profile</a></li>
                            <li><a class="dropdown-item" href="${basePath}/pages/orders/orders.html">Orders</a></li>`
                            +
                            adminLink
                        +
                        `
                        <li><a class="sign-out dropdown-item" href="#">Logout</a></li>
                        `;
                        
                        const signOutButton = document.querySelector(".sign-out");
                        if (signOutButton) {
                            signOutButton.addEventListener("click", async () => {
                            await signOut(auth);
                            location.reload();
                        });
                    }
                }

            } else {
                accountDropdown.innerHTML = "Account";
                accountDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="${basePath}/pages/auth/login.html">Login</a></li>
                <li><a class="dropdown-item" href="${basePath}/pages/auth/Register.html">Register</a></li>
                `;
            }
        });


    }
}

customElements.define("main-navbar", MainNavbar);
