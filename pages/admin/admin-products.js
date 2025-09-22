import { db } from "../../config/firebase-config.js";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let tbody = document.getElementById("products-tbody");
let addProductBtn = document.getElementById("add-product-btn");
let productForm = document.getElementById("product-form");
let modalTitle = document.getElementById("modal-title");
let confirmDeleteBtn = document.getElementById("confirm-delete-btn");
let searchInput = document.getElementById("search-input");
let productModal = new bootstrap.Modal(document.getElementById("product-modal"));
let deleteModal = new bootstrap.Modal(document.getElementById("delete-confirm-modal"));
let productIdToDelete = null;

function createTableRow(docs) {
    if (!docs || docs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center">No products found.</td></tr>`;
        return;
    }
    const rows = docs.map(doc => {
        const product = doc.data();
        const stockStatus = product.stock > 0 ? "success" : "danger";
        const stockText = product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock";
        return `
            <tr>
                <td><img src="${product.image}" class="rounded" 
                style="width: 60px; height: 60px; object-fit: cover;" alt="${product.name}"></td>
                <td><span class="fw-bold">${product.name}</span></td>
                <td><span class="fw-bold">${product.name_lowercase}</span></td>
                <td><span class="fw-bold">${product.isFeatured}</span></td>
                <td><span class="fw-bold">${product.rating}</span></td>
                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td><span class="badge bg-${stockStatus}">${stockText}</span></td>
                <td>${(product.price || 0).toFixed(2)} EGP</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-warning edit-btn" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    }).join('');
    tbody.innerHTML = rows;
}

async function displayProducts() {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading...</td></tr>`;
    try {
        const productsCollection = collection(db, "products");
        const prodctQuerybyName = query(productsCollection, orderBy("name"));
        const results = await getDocs(prodctQuerybyName);
        createTableRow(results.docs);
    } catch (error) {
        console.error("Error fetching products:", error);
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
}

//Form Subbmit
async function formSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById("product-id").value;
    const productName = document.getElementById("product-name").value;
    const productData = {
        name: productName,
        name_lowercase: productName.toLowerCase(),
        isFeatured: document.getElementById("isFeatured").value,
        rating: document.getElementById("rating").value,
        category: document.getElementById("product-category").value,
        price: parseFloat(document.getElementById("product-price").value),
        stock: parseInt(document.getElementById("product-stock").value),
        image: document.getElementById("product-image-url").value,
    };

    try {
        if (productId) {
            await updateDoc(doc(db, "products", productId), productData);
        } else {

            productData.createdAt = serverTimestamp();
            const docRef = await addDoc(collection(db, "products"), productData);

            const newSku = docRef.id.substring(0, 4).toUpperCase();

            await updateDoc(docRef, {
                sku: newSku
            });
        }
        productModal.hide();
        displayProducts(); 
    } catch (error) {
        console.error("Error saving product:", error);
        alert("Failed to save product.");
    }
}
function populateProductForm(productData, productId) {
    productForm.reset();
    modalTitle.textContent = "Edit Product";
    document.getElementById("product-id").value = productId;
    document.getElementById("product-name").value = productData.name || "";
    document.getElementById("name_lowercase").value = productData.name_lowercase,
    document.getElementById("isFeatured").value = productData.isFeatured || false,
    document.getElementById("rating").value = productData.rating,
    document.getElementById("product-sku").value = productData.sku || "";
    document.getElementById("product-category").value = productData.category || "";
    document.getElementById("product-price").value = productData.price || 0;
    document.getElementById("product-stock").value = productData.stock || 0;
    document.getElementById("product-image-url").value = productData.image || "";

}

async function deleteConfirm() {
    if (!productIdToDelete) return;
    try {
        await deleteDoc(doc(db, "products", productIdToDelete));
        deleteModal.hide();
        displayProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
    } finally {
        productIdToDelete = null;
    }
}

async function tableClick(e) {
    const target = e.target.closest("button");
    if (!target) return;
    const productId = target.dataset.id;
    if (!productId) return;
    if (target.classList.contains("edit-btn")) {
        const productResult = await getDoc(doc(db, "products", productId));
        if (productResult.exists()) {
            populateProductForm(productResult.data(), productId);
            productModal.show();
        }
    } else if (target.classList.contains("delete-btn")) {
        productIdToDelete = productId;
        deleteModal.show();
    }
}
document.addEventListener("DOMContentLoaded", async () => {
        displayProducts();   
    addProductBtn.addEventListener("click", () => {
        productForm.reset();
        document.getElementById("product-id").value = "";
        productModal.show();
    });
    productForm.addEventListener("submit", formSubmit);
    tbody.addEventListener("click", tableClick);
    confirmDeleteBtn.addEventListener("click", deleteConfirm);


    let typeTimer;
    searchInput.addEventListener("input", () => {
        clearTimeout(typeTimer);
        typeTimer = setTimeout(async () => {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) {
                displayProducts();
                return;
            }
            tbody.innerHTML = `<tr><td colspan="10" class="text-center">Searching...</td></tr>`;
            try {
                const prdocutQuery = query(collection(db, "products"), 
                orderBy("name"), where("name", ">=", searchTerm), where("name", "<=", searchTerm + "\uf8ff"));
                const results = await getDocs(prdocutQuery);
                createTableRow(results.docs);
            } catch (error) {
                console.error("Error during search:", error);
            }
        }, 600);
    });
})

