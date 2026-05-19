function switchToCreateAccount() {
    document.getElementById("login-container").classList.remove("active");
    setTimeout(() => {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("signup-container").style.display = "block";
        setTimeout(() => document.getElementById("signup-container").classList.add("active"), 10);
    }, 500); // Matches CSS transition duration
}

function switchToLogin() {
    document.getElementById("signup-container").classList.remove("active");
    setTimeout(() => {
        document.getElementById("signup-container").style.display = "none";
        document.getElementById("login-container").style.display = "block";
        setTimeout(() => document.getElementById("login-container").classList.add("active"), 10);
    }, 500);
}

function togglePasswordVisibility(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}
function signUpTypeValidation() {
    var type = document.getElementById("signUpType");
    if(type == "") {
        window.alert("Empty worker type");
    }
    if(type != "worker" || type != "pm") {
        window.alert("incorrect worker type please use pm or worker");
    }
}