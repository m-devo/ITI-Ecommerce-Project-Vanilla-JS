const form = document.getElementById("registerForm");

const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const pass = document.getElementById("password");
const confirmPass = document.getElementById("confirmPassword");

function validateFName() {
  if (!/^[A-Za-z ]+$/.test(fname.value.trim())) {
    fname.classList.add("error");
    document.getElementById("fnameError").style.display = "block";
    return false;
  }
  fname.classList.remove("error");
  document.getElementById("fnameError").style.display = "none";
  return true;
}

function validateLName() {
  if (!/^[A-Za-z ]+$/.test(lname.value.trim())) {
    lname.classList.add("error");
    document.getElementById("lnameError").style.display = "block";
    return false;
  }
  lname.classList.remove("error");
  document.getElementById("lnameError").style.display = "none";
  return true;
}

function validateEmail() {
  if (!/^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email.value.trim())) {
    email.classList.add("error");
    document.getElementById("emailError").style.display = "block";
    return false;
  }
  email.classList.remove("error");
  document.getElementById("emailError").style.display = "none";
  return true;
}

function validatePhone() {
  if (!/^01[0-9]{9}$/.test(phone.value.trim())) {
    phone.classList.add("error");
    document.getElementById("phoneError").style.display = "block";
    return false;
  }
  phone.classList.remove("error");
  document.getElementById("phoneError").style.display = "none";
  return true;
}

function validatePass() {
  if (!/^[A-Za-z0-9@#$%^&*!?]{6,20}$/.test(pass.value.trim())) {
    pass.classList.add("error");
    document.getElementById("passError").style.display = "block";
    return false;
  }
  pass.classList.remove("error");
  document.getElementById("passError").style.display = "none";
  return true;
}

function validateConfirmPass() {
  if (!/^[A-Za-z0-9@#$%^&*!?]{6,20}$/.test(confirmPass.value.trim())) {
    confirmPass.classList.add("error");
    document.getElementById("confirmError").style.display = "block";
    return false;
  }
  confirmPass.classList.remove("error");
  document.getElementById("confirmError").style.display = "none";
  return true;
}


fname.addEventListener("input", validateFName);
lname.addEventListener("input", validateLName);
email.addEventListener("input", validateEmail);
phone.addEventListener("input", validatePhone);
pass.addEventListener("input", validatePass);
confirmPass.addEventListener("input", validateConfirmPass);


form.addEventListener("submit", function (e) {
  if (
    !validateFName() ||
    !validateLName() ||
    !validateEmail() ||
    !validatePhone() ||
    !validatePass() ||
    !validateConfirmPass()
  ) {
    e.preventDefault();
  }
});