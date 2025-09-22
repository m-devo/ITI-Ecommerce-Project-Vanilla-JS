import { auth, db, storage } from '../../assets/js/firebase-config.js';

import {
    onAuthStateChanged,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
    ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// DOM Elements
const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const addressInput = document.getElementById("address");
const phoneInput = document.getElementById("phoneNum");
const dobInput = document.getElementById("dob");
const genderSelect = document.getElementById("gender");
const emailInput = document.getElementById("email");
const profileImg = document.getElementById("profileImg");

// Buttons
const updateBtn = document.getElementById("UpdateBtn");
const changePicBtn = document.getElementById("changePicBtn");
const signOutBtn = document.querySelector(".sidebar button");
const changeEmailBtn = document.querySelector(".security button.primary");
const changePassBtn = document.querySelector(".security button:not(.primary)");


onAuthStateChanged(auth, async (user) => {
    if (user) {
        emailInput.value = user.email;

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            fnameInput.value = data.fname || "";
            lnameInput.value = data.lname || "";
            addressInput.value = data.address || "";
            phoneInput.value = data.phone || "";
            dobInput.value = data.dob || "";
            genderSelect.value = data.gender || "Prefer not to say";
            profileImg.src = data.photoURL || "/pages/profile/150fa8800b0a0d5633abc1d1c4db3d87.jpg";
        }
    } else {
        window.location.href = "../auth/login.html";
    }
});


updateBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
        fname: fnameInput.value,
        lname: lnameInput.value,
        address: addressInput.value,
        phone: phoneInput.value,
        dob: dobInput.value,
        gender: genderSelect.value
    });

    alert("Profile updated successfully! ✅");
});


changePicBtn.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.click();

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) return;

        try {

            const storageRef = ref(storage, `profilePics/${user.uid}`);

            await uploadBytes(storageRef, file);

            const url = await getDownloadURL(storageRef);

            profileImg.src = url;

            await updateDoc(doc(db, "users", user.uid), {
                photoURL: url
            });

            alert("Profile picture updated! ✅");
        } catch (error) {
            console.error(error);
            alert("❌ Error uploading image: \n" + error.message);
        }
    };
});



changeEmailBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newEmail = prompt("Enter your new email:");
    if (!newEmail) return;

    const currentPassword = prompt("Enter your current password to confirm:");
    if (!currentPassword) return;

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        await updateEmail(user, newEmail);

        await updateDoc(doc(db, "users", user.uid), { email: newEmail });
        emailInput.value = newEmail;

        await user.sendEmailVerification();

        alert(`✅ Email updated successfully! \n A verification email has been sent to ${newEmail}. \n Please check your inbox and confirm.`);

    } catch (error) {
        if (error.code === "auth/operation-not-allowed") {
            alert("⚠️ Changing email is not allowed.\n Make sure Email/Password sign-in is enabled in Firebase Auth.");
        } else if (error.code === "auth/requires-recent-login") {
            alert("⚠️ Please login again and retry changing your email.");
        } else if (error.code === "auth/invalid-email") {
            alert("❌ The new email address is invalid.");
        } else {
            alert("❌ Error updating email: " + error.message);
        }
        console.error("Error updating email:", error);
    }
});

changePassBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newPassword = prompt("Enter your new password (at least 6 chars):");
    if (!newPassword) return;

    if (newPassword.length < 6) {
        alert("⚠️ Password must be at least 6 characters.");
        return;
    }

    try {
        const currentPassword = prompt("Enter your current password to confirm:");
        if (!currentPassword) return;

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        if (newPassword === currentPassword) {
            alert("⚠️ New password cannot be the same as the current password.");
            return;
        }

        await updatePassword(user, newPassword);
        alert("Password updated successfully! ✅");
    } catch (error) {
        console.error(error);
        alert("❌ Error updating password: " + error.message);
    }
});


signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../auth/login.html";
});