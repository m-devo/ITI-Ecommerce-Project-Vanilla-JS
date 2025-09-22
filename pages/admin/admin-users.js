import './auth-guard.js';
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

let tbody = document.getElementById("users-tbody");
let userForm = document.getElementById("user-form");
let modalTitle = document.getElementById("modal-title");
let searchInput = document.getElementById("search-input");
let userModal = new bootstrap.Modal(document.getElementById("user-modal"));
let deleteModal = new bootstrap.Modal(document.getElementById("delete-confirm-modal"));
let userIdToDelete = null;
let addUserBtn = document.getElementById("add-new-user");
let confirmDeleteBtn = document.getElementById("confirm-delete-btn");


function createTableRow(docs) {
    if (!docs || docs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center">No users found.</td></tr>`;
        return;
    }
    const rows = docs.map(doc => {
        const user = doc.data();
        const userId = doc.id;
        const statusClass = user.isActive ? "success" : "danger";
        const statusText = user.isActive ? "Active" : "Blocked";
        const joinedDate = user.createdAt?.toDate().toLocaleDateString('en-GB');
        const fullName = `${user.fname} ${user.lname}`

        return `
            <tr>
                <td><img src="${user.image}" class="rounded-circle" 
                style="width: 40px; height: 40px; object-fit: cover;" alt="${fullName}"></td>
                <td><span class="fw-bold">${fullName}</span></td>
                <td>${user.email}</td>
                <td>${user.address}</td>
                <td>${user.dob}</td>
                <td>${user.gender}</td>
                <td>${user.phone}</td>
                <td><span class="badge bg-${user.role === 'Admin' ? 'primary' : 'secondary'}">${user.role || 'User'}</span></td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td>${joinedDate}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${userId}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${userId}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`
    }).join('')
    tbody.innerHTML = rows
}

/******************************** Display Users *********************************/
async function displayUsers() {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center">Loading...</td></tr>`
    try {
        const usersCollection = collection(db, "users")
        const usersQuery = query(usersCollection, orderBy("fname"))
        const results = await getDocs(usersQuery);
        createTableRow(results.docs);
    } catch (error) {
        console.error("Error fetching users:", error);
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">failed to lod data to load data.</td></tr>`
    }
}
/******************************** Mgals *********************************/
async function formSubmit(e) {
    e.preventDefault();

    // const lowerCaseName = (fname+lname).towLowerCase()
    const userId = document.getElementById("user-id").value;
    const userData = {
        fname: document.getElementById("fname").value,
        lname: document.getElementById("lname").value,
        // lowerCase: lowerCaseName,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        phone: document.getElementById("phone").value,
        role: document.getElementById("role").value,
        isActive: document.getElementById("isActive").value,
        image: document.getElementById("user-image-url").value
    }

    try {
        if (userId) {
            await updateDoc(doc(db, "users", userId), userData);
        } else {
            userData.createdAt = serverTimestamp();
            await addDoc(collection(db, "users"), userData);
        }
        userModal.hide();
        displayUsers();
    } catch (error) {
        console.error("Error saving user:", error)
        alert("Failed to save user.")
    }
}


function populateUserForm(userData, userId) {
    userForm.reset();
    modalTitle.textContent = "Edit User";
    document.getElementById("user-id").value = userId;
    document.getElementById("fname").value = userData.fname || "";
    document.getElementById("lname").value = userData.lname || "";
    document.getElementById("email").value = userData.email || "";
    document.getElementById("address").value = userData.address || "";
    document.getElementById("dob").value = userData.dob || "";
    document.getElementById("gender").value = userData.gender || "";
    document.getElementById("phone").value = userData.phone || "";
    document.getElementById("role").value = userData.role || "User";
    document.getElementById("isActive").checked = userData.isActive || true;
    document.getElementById("user-image-url").value = userData.image || ""
}

// confirm delete
async function deleteConfirm() {
    if (!userIdToDelete) return;
    try {
        await deleteDoc(doc(db, "users", userIdToDelete));
        deleteModal.hide();
        displayUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.")
    } finally {
        userIdToDelete = null
    }
}

async function tableClick(e) {
    const target = e.target.closest("button");
    if (!target) return;
    const userId = target.dataset.id;
    if (!userId) return;

    if (target.classList.contains("edit-btn")) {
        const userResult = await getDoc(doc(db, "users", userId));
        if (userResult.exists()) {
            populateUserForm(userResult.data(), userId);
            userModal.show();
        }
    } else if (target.classList.contains("delete-btn")) {
        userIdToDelete = userId;
        deleteModal.show();
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    displayUsers();

    addUserBtn.addEventListener("click", () => {
        userForm.reset();
        document.getElementById("user-id").value = "";
        modalTitle.textContent = "Add User";
        userModal.show();
    });

    userForm.addEventListener("submit", formSubmit);
    tbody.addEventListener("click", tableClick);
    confirmDeleteBtn.addEventListener("click", deleteConfirm);

    let typeTimer;

    searchInput.addEventListener("input", () => {
        clearTimeout(typeTimer);
        typeTimer = setTimeout(async () => {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) {
                displayUsers();
                return;
            }
            tbody.innerHTML = `<tr><td colspan="11" class="text-center">Searching...</td></tr>`;
            try {
                const userQuery = query(
                    collection(db, "users"),
                    orderBy("fname"),
                    where("fname", ">=", searchTerm),
                    where("fname", "<=", searchTerm + "\uf8ff")
                );
                const results = await getDocs(userQuery);
                createTableRow(results.docs);
            } catch (error) {
                console.error("Error during search:", error);
            }
        }, 600);
    });
});
