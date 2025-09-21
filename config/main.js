export const brandName = "TechCave";

const origin = window.location.origin;
const projectFolder = window.location.pathname.split('/')[1];
const basePath = `${origin}/${projectFolder}`;

export const homePath = `${basePath}/index.html`;

export const paths = [
    { label: "Home", path: `${basePath}/index.html` },
    { label: "Products", path: `${basePath}/pages/products/products.html` },
    { 
        label: "Cart", 
        path: `${basePath}/pages/cart/cart.html`, 
        icon: '<i class="fas fa-shopping-cart"></i>'
    },
];