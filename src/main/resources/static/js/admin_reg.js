
document.addEventListener("DOMContentLoaded", function () {
    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
    const otpModal = new bootstrap.Modal(document.getElementById("otpModal"));
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");
    const otpInput = document.getElementById("otpInput");
    const otpError = document.getElementById("otpError");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");

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
    document.getElementById("registerForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        if (password.value !== confirmPassword.value) {
            passwordError.style.display = "block";
            return;
        }

        const data = {
            firstName: document.getElementById("firstName").value.trim(),
            middleInitial: document.getElementById("middleInitial").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            birthday: document.getElementById("birthday").value,
            sex: document.getElementById("sex").value,
            email: document.getElementById("email").value.trim(),
            cp: document.getElementById("cp").value.trim(),
            password: document.getElementById("password").value,
            role: "ADMIN" // 👈 Added fixed role value
        };

        
        console.log("Form Data Collected:", data);
        currentEmail = data.email; // store for OTP verification

        try {
            const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            });

            if (response.ok) {
            registerModal.hide();
            otpModal.show();
            } else {
            alert("Registration failed or email already exists!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error during registration.");
        }

        
        verifyOtpBtn.addEventListener("click", async () => {
        const otp = document.getElementById("otpInput").value;

        try {
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: currentEmail, otp: otp }),
            });

            if (response.ok) {
                otpModal.hide();
                alert("Account verified successfully! You can now log in.");
                location.reload();
            } else {
                document.getElementById("otpError").style.display = "block";
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server error during OTP verification.");
        }
    });
    });

    
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.querySelector("input[type='text']").value.trim();
  const password = e.target.querySelector("input[type='password']").value.trim();

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  console.log("Server response:", text);

  if (text === "LOGIN_SUCCESS_ADMIN") {
    window.location.href = "admin_view.html";
  } else if (text === "LOGIN_SUCCESS_SUPERUSER") {
    window.location.href = "super_view.html";
  } else {
    alert("Invalid email or password!");
  }
});





