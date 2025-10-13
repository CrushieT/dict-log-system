
document.addEventListener("DOMContentLoaded", function () {
    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
    const otpModal = new bootstrap.Modal(document.getElementById("otpModal"));
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");
    const otpInput = document.getElementById("otpInput");
    const otpError = document.getElementById("otpError");

    let generatedOtp = null;

    // Show register modal
    document.getElementById("registerLink").addEventListener("click", function (e) {
    e.preventDefault();
    registerModal.show();
    });

    // Cancel button
    document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("loginForm").reset();
    });

    // Confirm password check
    confirmPassword.addEventListener("input", function () {
    if (password.value !== confirmPassword.value) {
        passwordError.style.display = "block";
    } else {
        passwordError.style.display = "none";
    }
    });

    // Register form submit
    document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (password.value !== confirmPassword.value) {
        passwordError.style.display = "block";
        return;
    }

    // Generate fake 4-digit OTP
    generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", generatedOtp); // For development only
    registerModal.hide();
    otpModal.show();
    });

    // OTP verification
    document.getElementById("verifyOtpBtn").addEventListener("click", function () {
    const enteredOtp = otpInput.value.trim();
    if (enteredOtp === generatedOtp) {
        otpError.style.display = "none";
        otpModal.hide();
        alert("✅ Registration successful!");
        document.getElementById("registerForm").reset();
    } else {
        otpError.style.display = "block";
    }
    });
});
