import { auth, db } from "../../config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  setDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const errorMessageDiv = document.getElementById("error-message");
const successMessageDiv = document.getElementById("success-message");

function getErrorMessage(error) {
  switch (error.code) {
    // ===== Email & Password Errors =====
    case "auth/email-already-in-use":
      return "Unable to complete registration. Please try again.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/invalid-login-credentials":
      return "Incorrect email or password.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";

    // ===== Social Login (Google/GitHub) Errors =====
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Another sign-in attempt is already in progress.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for OAuth sign-in.";

    // ===== Forgot Password Errors =====
    case "auth/missing-email":
      return "Please provide an email address.";
    case "auth/invalid-recipient-email":
      return "The recipient email address is invalid.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    // ===== Default =====
    default:
      console.warn("Unhandled Firebase error:", error);
      return "Something went wrong. Please try again.";
  }
}

// ========= Register with Email/Password =========
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const Fname = document.getElementById("fname").value.trim();
    const Lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPass) {
      errorMessageDiv.innerText = "Passwords do not match.";
      errorMessageDiv.style.display = "block";
      document.getElementById("password").value = "";
      document.getElementById("confirmPassword").value = "";
      return;
    } else {
      errorMessageDiv.style.display = "none";
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      successMessageDiv.innerText =
        "Verification email sent. Please check your inbox! ✅";
      successMessageDiv.style.display = "block";

      await setDoc(doc(db, "users", user.uid), {
        fname: Fname,
        lname: Lname,
        email: email,
        phone: phone,
        role: "user",
        createdAt: new Date(),
        verified: false,
      });

      errorMessageDiv.innerText = "";
      errorMessageDiv.style.display = "none";

      const checkVerification = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkVerification);
          successMessageDiv.innerText = "Email verified! ✅ Redirecting...";
          setTimeout(() => {
            window.location.replace("../../index.html");
          }, 1500);
        }
      }, 3000);


    } catch (error) {
      errorMessageDiv.innerText = getErrorMessage(error);
      errorMessageDiv.style.display = "block";
      console.error("Error during registration: ", error);
    }
  });
}

// ========= Login with Email/Password & Remember Me =========
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const rememberMeCheckbox = document.getElementById("rememberMe");

    try {
            const persistenceType = rememberMeCheckbox.checked
                ? browserLocalPersistence
                : browserSessionPersistence;

            await setPersistence(auth, browserLocalPersistence);


            await signInWithEmailAndPassword(auth, email, password);

      await setPersistence(auth, persistenceType);

      await signInWithEmailAndPassword(auth, email, password);

      errorMessageDiv.innerText = "";
      errorMessageDiv.style.display = "none";
      window.location.replace("../../index.html");
    } catch (error) {
      console.log("Firebase Error:", error);
      errorMessageDiv.innerText = getErrorMessage(error);
      errorMessageDiv.style.display = "block";
      console.error("Error during login: ", error);
    }
  });
}

// ========= Google Sign-in =========
const googleBtn = document.querySelector(".google-btn");

async function handleSocialLogin(provider) {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        fname: user.displayName ? user.displayName.split(" ")[0] : "",
        lname: user.displayName
          ? user.displayName.split(" ").slice(1).join(" ")
          : "",
        email: user.email,
        phone: user.phoneNumber || "",
        role: "user",
        createdAt: new Date(),
      });
    }
    errorMessageDiv.style.display = "none";
    window.location.replace("../../index.html");
  } catch (error) {
    errorMessageDiv.innerText = getErrorMessage(error);
    errorMessageDiv.style.display = "block";
    console.error("Error during social login:", error);
  }
}

if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  });
}

// ========= Forgot password =========
const forgotLink = document.querySelector(".remember-forgot a");

if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = prompt("Enter your email to reset password:");

    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("✅ Password reset link has been sent to your email.");
      } catch (error) {
        alert("❌ " + getErrorMessage(error));
      }
    }
  });
}
