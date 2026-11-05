
/* =========================================
   NEXORA - AUTHENTICATION SYSTEM
   Login | Signup | Session Management
========================================= */

const AUTH_KEYS = {
    users: "collabUsers",
    currentUser: "collabCurrentUser"
};

// Read data from Local Storage
function getAuthData(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Nexora storage error:", error);
        return fallback;
    }
}

// Save data to Local Storage
function saveAuthData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique user ID
function generateUserId() {
    return "user_" + Date.now() + "_" +
        Math.random().toString(36).substring(2, 9);
}

// Display authentication messages
function showAuthMessage(elementId, message, type = "error") {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.style.color = type === "success" ? "#35d49a" : "#ff6b81";
    element.style.display = "block";
}

// Get current logged-in user
function getCurrentAuthUser() {
    return getAuthData(AUTH_KEYS.currentUser, null);
}

// =========================================
// SIGNUP
// =========================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("signupName")?.value.trim();
        const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
        const password = document.getElementById("signupPassword")?.value;

        if (!name || !email || !password) {
            showAuthMessage("signupMessage", "Please fill in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthMessage("signupMessage", "Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            showAuthMessage("signupMessage", "Password must contain at least 6 characters.");
            return;
        }

        const users = getAuthData(AUTH_KEYS.users, []);

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            showAuthMessage(
                "signupMessage",
                "An account with this email already exists."
            );
            return;
        }

        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveAuthData(AUTH_KEYS.users, users);

        // Create the user's initial profile
        const profile = {
            name: name,
            headline: "Creative Professional",
            location: "",
            about: "Welcome to my Nexora profile!",
            skills: [],
            portfolio: "",
            availability: "Available"
        };

        localStorage.setItem(
            "collabProfile_" + newUser.id,
            JSON.stringify(profile)
        );

        // Automatically log in after signup
        const sessionUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };

        saveAuthData(AUTH_KEYS.currentUser, sessionUser);

        showAuthMessage(
            "signupMessage",
            "Welcome to Nexora! Your account has been created.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);
    });
}

// =========================================
// LOGIN
// =========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
        const password = document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            showAuthMessage("loginMessage", "Please enter your email and password.");
            return;
        }

        const users = getAuthData(AUTH_KEYS.users, []);

        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            showAuthMessage(
                "loginMessage",
                "Invalid email or password. Please try again."
            );
            return;
        }

        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        saveAuthData(AUTH_KEYS.currentUser, sessionUser);

        showAuthMessage(
            "loginMessage",
            "Login successful! Welcome to Nexora.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);
    });
}

// =========================================
// LOGIN / SIGNUP FORM SWITCHING
// =========================================

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

if (showLogin) {
    showLogin.addEventListener("click", function (event) {
        event.preventDefault();

        document.getElementById("loginForm")?.classList.remove("hidden");
        document.getElementById("signupForm")?.classList.add("hidden");

        document.getElementById("loginMessage").textContent = "";
        document.getElementById("signupMessage").textContent = "";
    });
}

if (showSignup) {
    showSignup.addEventListener("click", function (event) {
        event.preventDefault();

        document.getElementById("signupForm")?.classList.remove("hidden");
        document.getElementById("loginForm")?.classList.add("hidden");

        document.getElementById("loginMessage").textContent = "";
        document.getElementById("signupMessage").textContent = "";
    });
}

// =========================================
// PAGE ACCESS PROTECTION
// =========================================

const currentPage = document.body.dataset.page;

const publicPages = ["login", "signup", "index"];

const currentSession = getCurrentAuthUser();

if (currentPage && !publicPages.includes(currentPage)) {
    if (!currentSession || !currentSession.id) {
        window.location.href = "index.html";
    }
}

// Redirect logged-in users away from login page
if (
    currentPage === "login" ||
    currentPage === "signup" ||
    currentPage === "index"
) {
    if (currentSession && currentSession.id) {
        window.location.href = "dashboard.html";
    }
}

// =========================================
// NEXORA LOGOUT
// =========================================

function logoutNexora() {
    localStorage.removeItem(AUTH_KEYS.currentUser);
    window.location.href = "index.html";
}

window.logoutNexora = logoutNexora;

console.log("Nexora authentication system initialized.");
