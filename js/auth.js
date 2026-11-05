
/* =========================================
   NEXORA AUTHENTICATION
   Login | Signup | Session | Logout
========================================= */

const AUTH_KEYS = {
    users: "collabUsers",
    currentUser: "collabCurrentUser"
};

// =========================================
// STORAGE HELPERS
// =========================================

function getAuthData(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Nexora storage error:", error);
        return fallback;
    }
}

function saveAuthData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentAuthUser() {
    return getAuthData(AUTH_KEYS.currentUser, null);
}

function generateUserId() {
    return "user_" + Date.now() + "_" +
        Math.random().toString(36).substring(2, 9);
}

// =========================================
// MESSAGE HELPER
// =========================================

function showAuthMessage(elementId, message, type = "error") {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.style.color =
        type === "success" ? "#35d49a" : "#ff6b81";
}

// =========================================
// LOGIN / SIGNUP SWITCHING
// =========================================

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

function switchAuthForm(type) {
    if (!loginForm || !signupForm) return;

    const isLogin = type === "login";

    // Use hidden property directly
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;

    showLogin?.classList.toggle("active", isLogin);
    showSignup?.classList.toggle("active", !isLogin);

    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");

    if (loginMessage) loginMessage.textContent = "";
    if (signupMessage) signupMessage.textContent = "";
}

showLogin?.addEventListener("click", function () {
    switchAuthForm("login");
});

showSignup?.addEventListener("click", function () {
    switchAuthForm("signup");
});

// Ensure login is the initial visible form
if (loginForm && signupForm) {
    switchAuthForm("login");
}

// =========================================
// SIGNUP
// =========================================

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name =
            document.getElementById("signupName")?.value.trim();

        const email =
            document.getElementById("signupEmail")?.value.trim().toLowerCase();

        const password =
            document.getElementById("signupPassword")?.value;

        if (!name || !email || !password) {
            showAuthMessage(
                "signupMessage",
                "Please fill in all fields."
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthMessage(
                "signupMessage",
                "Please enter a valid email address."
            );
            return;
        }

        if (password.length < 6) {
            showAuthMessage(
                "signupMessage",
                "Password must contain at least 6 characters."
            );
            return;
        }

        const users = getAuthData(AUTH_KEYS.users, []);

        const existingUser = users.find(
            user => user.email?.toLowerCase() === email
        );

        if (existingUser) {
            showAuthMessage(
                "signupMessage",
                "An account with this email already exists."
            );
            return;
        }

        const newUser = {
            id: generateUserId(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        saveAuthData(AUTH_KEYS.users, users);

        // Create initial profile
        const profile = {
            name,
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

        // Create login session
        saveAuthData(AUTH_KEYS.currentUser, {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

        showAuthMessage(
            "signupMessage",
            "Welcome to Nexora! Your account has been created.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);
    });
}

// =========================================
// LOGIN
// =========================================

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email =
            document.getElementById("loginEmail")?.value.trim().toLowerCase();

        const password =
            document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            showAuthMessage(
                "loginMessage",
                "Please enter your email and password."
            );
            return;
        }

        const users = getAuthData(AUTH_KEYS.users, []);

        const user = users.find(
            item =>
                item.email?.toLowerCase() === email &&
                item.password === password
        );

        if (!user) {
            showAuthMessage(
                "loginMessage",
                "Invalid email or password. Please try again."
            );
            return;
        }

        saveAuthData(AUTH_KEYS.currentUser, {
            id: user.id,
            name: user.name,
            email: user.email
        });

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
// PAGE ACCESS PROTECTION
// =========================================

const currentPage = document.body.dataset.page;
const currentSession = getCurrentAuthUser();

const isAuthPage = currentPage === "auth";

// Protect internal pages
if (!isAuthPage && (!currentSession || !currentSession.id)) {
    window.location.replace("index.html");
}

// Do not redirect automatically from the login page.
// Users can choose Login or Sign Up themselves.

// =========================================
// LOGOUT
// =========================================

function logoutNexora() {
    localStorage.removeItem(AUTH_KEYS.currentUser);
    window.location.replace("index.html");
}

window.logoutNexora = logoutNexora;

console.log("Nexora authentication initialized successfully.");

// =========================================
// NEXORA LOGOUT BUTTON FIX
// =========================================

document.addEventListener("click", function (event) {
    const logoutButton = event.target.closest("#logoutButton");

    if (logoutButton) {
        event.preventDefault();
        logoutNexora();
    }
});
