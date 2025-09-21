const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

function validateLoginEmail() {
  if (!/^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(loginEmail.value.trim())) {
    loginEmail.classList.add("error");
    document.getElementById("emailError").style.display = "block";
    return false;
  }
  loginEmail.classList.remove("error");
  document.getElementById("emailError").style.display = "none";
  return true;
}

function validateLoginPassword() {
  if (!/^[A-Za-z0-9]{4,12}$/.test(loginPassword.value)) {
    loginPassword.classList.add("error");
    document.getElementById("passwordError").style.display = "block";
    return false;
  }
  loginPassword.classList.remove("error");
  document.getElementById("passwordError").style.display = "none";
  return true;
}


loginEmail.addEventListener("input", validateLoginEmail);
loginPassword.addEventListener("input", validateLoginPassword);


loginForm.addEventListener("submit", function (e) {
  if (!validateLoginEmail() || !validateLoginPassword()) {
    e.preventDefault();
  }
});