
import {onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"

import { auth, db } from '../../config/firebase-config.js';
import './auth-guard.js' 
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
   console.log("User is logged in. UID:", user.uid);
        if (userDoc.exists() && userDoc.data().role === 'Admin') {

            console.log("Welcome Admin!");

        } else {
            alert("You do not have permission to access this page.");
            window.location.replace('../home/index.html'); 
        }
    } else {

        console.log("No user is signed in.");
        window.location.replace('../auth/login.html');
    }
});
//********************/