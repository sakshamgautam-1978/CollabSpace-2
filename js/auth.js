
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. STORAGE CONFIGURATION
    // =====================================

    const USERS_KEY = "collabUsers";
    const CURRENT_USER_KEY = "collabCurrentUser";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        } catch (error) {
            return null;
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(user)
        );
    }

    // =====================================
    // 2. HELPER FUNCTIONS
    // =====================================

    function showMessage(element, message, type = "error") {
        if (!element) return;

        element.textContent = message;
        element.style.color =
            type === "success" ? "#31c48d" : "#f06475";
    }

    function createUserId() {
        return "user_" + Date.now() + "_" +
            Math.random().toString(36).slice(2, 8);
    }

    function initialiseUserData(user) {

        const profile = {
            id: user.id,
            name: user.name,
            email: user.email,
            headline: "Creator on CollabSpace",
            location: "",
            about: "",
            skills: [],
            portfolio: "",
            availability: "Available"
        };

        localStorage.setItem(
            "collabProfile_" + user.id,
            JSON.stringify(profile)
        );

        return profile;
    }

    // =====================================
    // 3. LOGIN / SIGNUP ELEMENTS
    // =====================================

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const showLogin = document.getElementById("showLogin");
    const showSignup = document.getElementById("showSignup");

    // =====================================
    // 4. SWITCH AUTHENTICATION FORMS
    // =====================================

    function displayLogin() {

        if (!loginForm || !signupForm) return;

        loginForm.hidden = false;
        signupForm.hidden = true;

        showLogin?.classList.add("active");
        showSignup?.classList.remove("active");
    }

    function displaySignup() {

        if (!loginForm || !signupForm) return;

        loginForm.hidden = true;
        signupForm.hidden = false;

        showSignup?.classList.add("active");
        showLogin?.classList.remove("active");
    }

    showLogin?.addEventListener("click", displayLogin);
    showSignup?.addEventListener("click", displaySignup);

    // =====================================
    // 5. AUTOMATIC SESSION REDIRECT
    // =====================================

    const currentPage = document.body.dataset.page;

    if (currentPage === "auth" && getCurrentUser()) {
        window.location.replace("dashboard.html");
        return;
    }

    // =====================================
    // 6. SIGNUP FUNCTIONALITY
    // =====================================

    if (signupForm) {

        signupForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const name =
                document.getElementById("signupName").value.trim();

            const email =
                document.getElementById("signupEmail").value.trim().toLowerCase();

            const password =
                document.getElementById("signupPassword").value;

            const message =
                document.getElementById("signupMessage");

            if (name.length < 2) {
                showMessage(message, "Please enter a valid name.");
                return;
            }

            if (password.length < 6) {
                showMessage(message, "Password must contain at least 6 characters.");
                return;
            }

            const users = getUsers();

            const existingUser = users.find(
                user => user.email === email
            );

            if (existingUser) {
                showMessage(
                    message,
                    "An account with this email already exists."
                );
                return;
            }

            const newUser = {
                id: createUserId(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);

            const sessionUser = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            };

            setCurrentUser(sessionUser);
            initialiseUserData(sessionUser);

            showMessage(
                message,
                "Account created successfully! Redirecting...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 700);

        });
    }

    // =====================================
    // 7. LOGIN FUNCTIONALITY
    // =====================================

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail").value.trim().toLowerCase();

            const password =
                document.getElementById("loginPassword").value;

            const message =
                document.getElementById("loginMessage");

            const users = getUsers();

            const matchedUser = users.find(function (user) {
                return user.email === email &&
                    user.password === password;
            });

            if (!matchedUser) {
                showMessage(
                    message,
                    "Incorrect email or password. Please try again."
                );
                return;
            }

            const sessionUser = {
                id: matchedUser.id,
                name: matchedUser.name,
                email: matchedUser.email
            };

            setCurrentUser(sessionUser);

            showMessage(
                message,
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 500);

        });
    }

    // =====================================
    // 8. LOGOUT FUNCTIONALITY
    // =====================================

    document.addEventListener("click", function (event) {

        const logoutButton = event.target.closest("#logoutButton");

        if (!logoutButton) return;

        const confirmLogout = window.confirm(
            "Are you sure you want to log out?"
        );

        if (confirmLogout) {

            localStorage.removeItem(CURRENT_USER_KEY);

            window.location.replace("index.html");
        }

    });

    // =====================================
    // 9. AUTHENTICATION PROTECTION
    // =====================================

    const publicPages = ["auth"];

    if (!publicPages.includes(currentPage)) {

        const currentUser = getCurrentUser();

        if (!currentUser) {
            window.location.replace("index.html");
            return;
        }
    }

    console.log("CollabSpace authentication loaded.");

});
