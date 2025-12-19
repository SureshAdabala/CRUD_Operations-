
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? "http://localhost:3000" : "";

// Login Function
async function login() {
    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;

    if (!usernameInput || !passwordInput) {
        alert("Please enter username and password");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            localStorage.setItem("role", data.user.role);
            localStorage.setItem("username", data.user.username);

            if (data.user.role === 'admin') {
                window.location.href = "index.html";
            } else {
                window.location.href = "user.html";
            }
        } else {
            alert(data.message || "Login failed");
        }
    } catch (error) {
        console.error(error);
        alert("Login failed. Is npm start running?");
    }
}

// Signup Function
async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    if (!username || !email || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Account created successfully! Redirecting to Sign In...");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Signup failed");
        }

    } catch (error) {
        console.error(error);
        alert("Signup failed. Is npm start running?");
    }
}
