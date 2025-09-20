export const brandName = "TechCave";

const URL = window.location.href;
const basePath = URL.substring(0, URL.indexOf("/"));

export const homePath = `${basePath}/index.html`;

export const paths = [
  { label: "Home", path: `${basePath}/index.html` },
  { label: "Products", path: `${basePath}/pages/products/products.html` },
  {
    label: "Wishlist",
    path: `${basePath}/pages/wishlist/wishlist.html`,
    icon: '<i class="fas fa-heart"></i>',
  },
  {
    label: "Cart",
    path: `${basePath}/pages/cart/cart.html`,
    icon: '<i class="fas fa-shopping-cart"></i>',
  },
];
