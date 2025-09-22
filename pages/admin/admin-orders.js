import { db } from "../../config/firebase-config.js";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let tbody = document.getElementById("orders-tbody");
let addOrderBtn = document.getElementById("add-order-btn");
let orderForm = document.getElementById("order-form");
let modalTitle = document.getElementById("modal-title");
let confirmDeleteBtn = document.getElementById("confirm-delete-btn");
let searchInput = document.getElementById("search-input");
let orderModal = new bootstrap.Modal(document.getElementById("order-modal"));
let orderIdToDelete = null;
const deleteModal = new bootstrap.Modal(document.getElementById("delete-confirm-modal"));

const getStatusBadge = (orderStatus) => {
    const statusMap = {
        "pending": "warning",
        "shipped": "info",
        "delivered": "success",
        "canceled": "danger"
    };
    return statusMap[orderStatus] || "secondary"; 
};

function createTableRow(docs) {
    if (!docs || docs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center">No orders found.</td></tr>`;
        return;
    }
    const rows = docs.map(doc => {
        const order = doc.data();
        const orderId = doc.id;
        const orderStatus = getStatusBadge(order.status);
        const orderDate = order.createdAt.toDate().toLocaleDateString('en-US');
        const productsList = order.products.map(product => {
            return `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
            `;
        }).join('');
        return `
            <tr>
                <td><span class="fw-bold">#${orderId.substring(0, 6).toUpperCase()}</span></td>
                <td>${order.userName}</td>
                <td>${order.address}</td>
                ${productsList}
                <td>${order.paymentMethod}</td>
                <td>${(order.total || 0).toFixed(2)} EGP</td>
                <td><span class="badge bg-${orderStatus}">${order.status}</span></td>
                <td>${orderDate}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${orderId}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${orderId}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    }).join('');
    tbody.innerHTML = rows;
}

async function displayOrders() {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading...</td></tr>`;
    try {
        const ordersCollection = collection(db, "orders");
        const orderQuerybyDate = query(ordersCollection, orderBy("createdAt"));
        const results = await getDocs(orderQuerybyDate);
        createTableRow(results.docs);
    } catch (error) {
        console.error("Error fetching orders:", error);
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
}

async function formSubmit(e) {
    e.preventDefault();
    const orderId = document.getElementById("order-id").value;
    const orderData = {
        userName: document.getElementById("user-name").value,
        address: document.getElementById("address").value,
        paymentMethod: document.getElementById("payment-method").value,
        total: parseFloat(document.getElementById("total").value) || 0,
        status: document.getElementById("order-status").value,
    }
    try {
        if (orderId) {
            await updateDoc(doc(db, "orders", orderId), orderData);
        } else {
            orderData.createdAt = serverTimestamp();
            await addDoc(collection(db, "orders"), orderData);
        }
        orderModal.hide();
        displayOrders();
    } catch (error) {
        console.error("Error saving order:", error)
        alert("Failed to save order.")
    }
}

function populateOrderForm(orderData, orderId) {
    orderForm.reset();
    modalTitle.textContent = "Edit Order";
    document.getElementById("order-id").value = orderId;
    document.getElementById("user-name").value = orderData.userName || "";
    document.getElementById("address").value = orderData.address || "";
    document.getElementById("payment-method").value = orderData.paymentMethod || "";
    document.getElementById("total").value = orderData.total || "";
    document.getElementById("order-status").value = orderData.status || "";
}

async function confirmDelete() {
    if (!orderIdToDelete) return;
    try {
        await deleteDoc(doc(db, "orders", orderIdToDelete));
        deleteModal.hide();
        displayOrders();
    } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order.")
    } finally {
        orderIdToDelete = null
    }
}

async function tableClick(e) {
    const target = e.target.closest("button");
    if (!target) return;
    const orderId = target.dataset.id;
    if (!orderId) return;
    if (target.classList.contains("edit-btn")) {
        const orderResult = await getDoc(doc(db, "orders", orderId));
        if (orderResult.exists()) {
            populateOrderForm(orderResult.data(), orderId);
            orderModal.show();
        }
    } else if (target.classList.contains("delete-btn")) {
        orderIdToDelete = orderId;
        deleteModal.show();
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    displayOrders();
    addOrderBtn.addEventListener("click", () => {
        orderForm.reset();
        document.getElementById("order-id").value = "";
        modalTitle.textContent = "Add New Order";
        orderModal.show();
    });
    orderForm.addEventListener("submit", formSubmit);

    tbody.addEventListener("click", tableClick);

    confirmDeleteBtn.addEventListener("click", confirmDelete);

    let typeTimer;

    searchInput.addEventListener("input", () => {

        clearTimeout(typeTimer);
        typeTimer = setTimeout(async () => {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) {
                displayOrders();
                return;
            }
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Searching...</td></tr>`;
            try {
                const orderQuery = query(
                    collection(db, "orders"),
                    orderBy("userName"),
                    where("userName", ">=", searchTerm),
                    where("userName", "<=", searchTerm + "\uf8ff")
                );
                const results = await getDocs(orderQuery);
                createTableRow(results.docs);
            } catch (error) {
                console.error("Error during search:", error);
            }
        }, 600);
    });
})
