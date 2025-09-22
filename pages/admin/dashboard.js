import './auth-guard.js'
import { db } from "../../config/firebase-config.js";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    getCountFromServer,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

/******************************* Main Statistics *******************************/
// calculating monthly and annually earnining
async function calculateEarnings(timeRange) {
    const today = new Date();
    let startDate
    let id;

    switch (timeRange) {
        case "monthly":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            id = "monthly-sales";
            break
        case "annual":
            startDate = new Date(today.getFullYear(), 0, 1);
            id = "annual-earnings";
            break
        default:
            return
    }

    const target = document.getElementById(id);
    if (!target) return

    try {
        const ordersQuery = query(collection(db, "orders"), where("status", "==", "delivered"),
            // where("createdAt", ">=", Timestamp.fromDate(startDate)), 
        );

        const results = await getDocs(ordersQuery);

        let totalEarnings = 0;
        results.forEach(function (doc) {
            {
                const data = doc.data();
                totalEarnings += Number(data.total) || 0;
            }
        });

        console.log("startDate:", startDate)
        // results.forEach((doc) => {
        // console.log("order:", doc.id, doc.data());
        // });
        target.textContent = `${totalEarnings.toFixed(2)} EGP`;
    } catch (error) {
        console.error(`Can not fetch ${timeRange} earnings:`, error);
        target.textContent = "error";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    calculateEarnings("monthly")
    calculateEarnings("annual")
});
// caultulaing orders products and users number****
const targets = {
    products: document.getElementById("total-products"),
    orders: document.getElementById("total-orders"),
    users: document.getElementById("total-users"),

    newProducts: document.getElementById("new-products"),
    newOrders: document.getElementById("new-orders"),
    newUsers: document.getElementById("new-users"),
}

async function updateCount(colName, target) {

    if (!target) {
        return
    }

    target.textContent = "..."

    try {
        const collData = collection(db, colName);
        const results = await getCountFromServer(collData)
        target.textContent = results.data().count;
    } catch (error) {
        console.error(`Failed to fetch count for ${colName}:`, error);
        target.textContent = "error"
    }
}

async function countingEveryNew(colName, target) {

    if (!target) {
        return
    }
    target.textContent = "..."
    try {

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

        const collData = collection(db, colName)
        const searchQuery = query(collData, where("createdAt", ">=", twoDaysAgo))

        const results = await getCountFromServer(searchQuery);
        target.textContent = results.data().count;
    } catch (error) {
        console.error(`Can not fetch new items count for ${colName}:`, error)
        container.textContent = "error"
    }
}

async function statistics() {
    await Promise.all([
        updateCount("products", targets.products),
        updateCount("orders", targets.orders),
        updateCount("users", targets.users),

        countingEveryNew("products", targets.newProducts),
        countingEveryNew("orders", targets.newOrders),
        countingEveryNew("users", targets.newUsers)
    ])
}

document.addEventListener("DOMContentLoaded", statistics);

/******************************* Quick Actions *******************************/

// Blocking a certain user by email

const userSearchBtn = document.getElementById("user-search-btn");
const userSearchInput = document.getElementById("user-search-input");
const userSearchResults = document.getElementById("user-search-results");

userSearchBtn.addEventListener("click", async function () {

    const email = userSearchInput.value.trim()

    if (!email) {
        userSearchResults.innerHTML = "<p>Please enter an email.</p>";
        return
    }

    userSearchResults.innerHTML = "<p>Searching...</p>";

    try {
        const emailSearchQuery = query(collection(db, "users"), where("email", "==", email));
        const results = await getDocs(emailSearchQuery);

        if (results.empty) {
            userSearchResults.innerHTML = "<p>User not found.</p>";
            return
        }

        const userDoc = results.docs[0]
        const userData = userDoc.data()
        const isActive = userData.isActive !== false

        let check = "";
        let statusLabel = "";

        if (isActive) {
            check = "checked";
            statusLabel = "Account is Active";
        } else {
            check = "";
            statusLabel = "Account is Disabled";
        }

        userSearchResults.innerHTML = `
            <div class="card card-body">
                <h6>${userData.name} (${userData.email})</h6>
                <div class="form-check form-switch">
                    <input class="form-check-input user-status-toggle" 
                        type="checkbox" 
                        data-id="${userDoc.id}" 
                        ${check}>
                    <label class="form-check-label">${statusLabel}</label>
                </div>
            </div>`;
    } catch (error) {
        console.error("error searching for user: ", error);
        userSearchResults.innerHTML =
            '<p class="text-danger">An error occurred.</p>';
    }
});

userSearchResults.addEventListener("change", async (e) => {
    if (e.target.classList.contains("user-status-toggle")) {
        const userId = e.target.dataset.id;
        const newStatus = e.target.checked;
        const label = e.target.nextElementSibling;

        try {
            await updateDoc(doc(db, "users", userId), { isActive: newStatus });

            if (newStatus) {
                label.textContent = "Account is Active";
            } else {
                label.textContent = "Account is Disabled";
            }

        } catch (error) {
            console.error("error updating user status:", error);
            alert("failed to update the status of the user.");
            e.target.checked = !newStatus;
        }
    }
});

//

const manageOrdersModal = document.getElementById("manageOrdersModal");
const ordersStatusContainer = document.getElementById("orders-status-container");

manageOrdersModal.addEventListener("show.bs.modal", async () => {
    ordersStatusContainer.innerHTML = "<p>Loading pending orders...</p>";
    try {
        const searchQuery = query(collection(db, "orders"),orderBy("createdAt", "desc"), limit(5));
        const results = await getDocs(searchQuery);
        if (results.empty) {
            ordersStatusContainer.innerHTML = "<p>No pending orders found.</p>";
            return;
        }

        let changingOrderStatus = '<ul class="list-group">';

        const statuses = ['pending', 'shipped', 'canceled', 'delivered'];

        results.forEach((result) => {
            const data = result.data();
            const options = statuses.map(status => `
                <option value="${status}" ${data.status === status ? 'selected' : ''}>
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
            `).join('');

            changingOrderStatus += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>Order #${result.id.substring(0, 8)}</div>
                    <select class="form-select form-select-sm order-status-select" data-id="${result.id}" style="width: 120px;">
                        ${options}
                    </select>
                </li>`;
        });
        changingOrderStatus += "</ul>";
        ordersStatusContainer.innerHTML = changingOrderStatus;
    } catch (error) {
        console.error("can not fetch orders:", error);
        ordersStatusContainer.innerHTML =
            '<p class="text-danger">Failed to load orders.</p>';
    }
});

ordersStatusContainer.addEventListener("change", async (e) => {
    if (e.target.classList.contains("order-status-select")) {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });

            if (newStatus !== "pending") {
                e.target.closest("li").remove();
            } else {
                e.target.disabled = true;
                e.target.parentElement.innerHTML +=
                    ' <span class="text-success small">Saved!</span>';
            }
        } catch (error) {
            alert("Failed to update status.");
        }
    }
});

/******************************** */
const saveProductBtn = document.getElementById("save-product-btn");
const addProductForm = document.getElementById("add-product-form");
const addProductModal = new bootstrap.Modal(document.getElementById("addProductModal"));

/* Cloudinary Upload */
async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "orgqhssm"); 

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/duxham3xj/image/upload`; 

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            throw new Error("Image upload failed");
        }
        const data = await response.json();
        return data.secure_url; 
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        alert("Failed to upload image.");
        return null;
    }
}

saveProductBtn.addEventListener("click", async () => {

    const name = document.getElementById("product-name").value.trim();
    const description = document.getElementById("product-description").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const stock = parseInt(document.getElementById("product-stock").value);
    const category = document.getElementById("product-category").value.trim();
    
    const imageUpload = document.getElementById("product-image-file").files[0];
    const imageUrlInput = document.getElementById("product-image-url").value.trim();

    if (!name && !category && isNaN(price) && isNaN(stock)) {
        alert("Please fill out these required fields: Name, Category, Price, and Stock");
        return;
    }

    let finalImageUrl = "";
    saveProductBtn.disabled = true; 
    saveProductBtn.textContent = "Saving...";

    try {

        if (imageUpload) {

            finalImageUrl = await uploadImageToCloudinary(imageUpload);
            if (!finalImageUrl) { 
                saveProductBtn.disabled = false;
                saveProductBtn.textContent = "Save Product";
                return; 
            }
        } else if (imageUrlInput) {

            finalImageUrl = imageUrlInput;
        }

        await addDoc(collection(db, "products"), {
            name: name,
            description: description,
            price: price,
            stock: stock,
            category: category,
            imageUrl: finalImageUrl,                /*<<<<<<<<<<final url whether Cloudinary or odinary url  */
            createdAt: serverTimestamp(),
        });

        alert("Product added successfully!");
        addProductForm.reset();
        addProductModal.hide();

    } catch (error) {
        console.error("Error adding product: ", error);
        alert("Failed to add product.");
    } finally {

        saveProductBtn.disabled = false;
        saveProductBtn.textContent = "Save Product";
    }
});
/******************************* Last Five Orders *******************************/

function getStatusBadge(status) {
    status = status.toLowerCase();
    switch (status) {
        case "delivered":
            return '<span class="badge bg-success">Delivered</span>';
        case "pending":
            return '<span class="badge bg-warning text-dark">Pending</span>';
        case "shipped":
            return '<span class="badge bg-info text-white">Shipped</span>';
        case "canceled":
            return '<span class="badge bg-danger">Canceled</span>';
        default:
            return `<span class="badge bg-secondary">${status}</span>`;
    }
}

async function loadRecentOrders() {
    const tbody = document.getElementById("recent-orders-tbody");
    tbody.innerHTML =
        '<tr><td colspan="3" class="text-center">Loading...</td></tr>';

    try {
        const ordesSearchQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(5)
        );
        const results = await getDocs(ordesSearchQuery);

        if (results.empty) {
            tbody.innerHTML =
                '<tr><td colspan="3" class="text-center">No recent orders found.</td></tr>';
            return;
        }

        let recentActivityRow = "";
        results.forEach((doc) => {
            const order = doc.data();
            recentActivityRow += `
                <tr>
                    <td>#${doc.id.substring(0, 6)}</td>
                    <td>${order.userName || "N/A"}</td>
                    <td>${getStatusBadge(order.status)}</td>
                </tr>
            `;
        });
        tbody.innerHTML = recentActivityRow;
    } catch (error) {
        console.error("error loading recent orders:", error)
        tbody.innerHTML =
            '<tr><td colspan="3" class="text-center text-danger">Failed to load orders.</td></tr>'
    }
}

/******************************* Recent Activities *******************************/

async function loadRecentActivities() {
    const list = document.getElementById("recent-activities-list");
    list.innerHTML = '<li class="list-group-item">Loading...</li>';

    try {
        const usersQuery = query( collection(db, "users"), orderBy("createdAt", "desc"),limit(3));
        const productsQuery = query( collection(db, "products"), orderBy("createdAt", "desc"),limit(3));
        const ordersQuery = query(collection(db, "orders"),orderBy("createdAt", "desc"), limit(3));

        const [userQueryResult, productQueryResult, orderQueryResult] = await Promise.all([
            getDocs(usersQuery),
            getDocs(productsQuery),
            getDocs(ordersQuery),
        ]);

        let activities = [];
        userQueryResult.forEach((doc) =>
            activities.push({
                type: "user",
                data: doc.data(),
                timestamp: doc.data().createdAt,
            })
        );
        productQueryResult.forEach((doc) =>
            activities.push({
                type: "product",
                data: doc.data(),
                id: doc.id,
                timestamp: doc.data().createdAt,
            })
        );
        orderQueryResult.forEach((doc) =>
            activities.push({
                type: "order",
                data: doc.data(),
                id: doc.id,
                timestamp: doc.data().createdAt,
            })
        );

        activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        const latestActivities = activities.slice(0, 5);

        if (latestActivities.length === 0) {
            list.innerHTML = '<li class="list-group-item">No recent activities.</li>';
            return;
        }

        let recentActivities = "";
        latestActivities.forEach((activity) => {
            switch (activity.type) {
                case "user":
                    const fullName = `${activity.data.fname || ''} ${activity.data.lname || ''}`.trim();
                    const displayName = fullName || activity.data.email || "Unnamed";
                    
                    recentActivities += `<li class="list-group-item"><i class="fas fa-user-plus text-success me-2"></i> New user <b>${displayName}</b> registered.</li>`;
                    break;
                    break;
                case "product":
                    recentActivities += `<li class="list-group-item"><i class="fas fa-box text-primary me-2"></i> Product <b>${activity.data.name}</b> was added.</li>`;
                    break;
                case "order":
                    recentActivities += `<li class="list-group-item"><i class="fas fa-shopping-cart text-warning me-2"></i> New order <b>#${activity.id.substring(
                        0,
                        6
                    )}</b> was placed.</li>`
                    break;
            }
        });
        list.innerHTML = recentActivities
    } catch (error) {
        console.error("Error loading recent activities:", error);
        list.innerHTML =
            '<li class="list-group-item text-danger">Failed to load activities.</li>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadRecentOrders();
    loadRecentActivities();
});

/******************************* Time *******************************/
document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("live-date-time");

    function dispayTimeAndDate() {
        if (target) {
            const today = new Date();
            const localization = today.toLocaleString("en-US");
            target.textContent = localization;
        }
    }

    dispayTimeAndDate();
    setInterval(dispayTimeAndDate, 60000);
});