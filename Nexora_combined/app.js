/* =========================================================
   NEXORA APP.JS
   Combined from the original auth.js, navigation.js and script.js.
========================================================= */

/* =========================================
   NEXORA AUTHENTICATION
========================================= */

const AUTH_KEYS = {
    users: "collabUsers",
    currentUser: "collabCurrentUser"
};

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

function showAuthMessage(elementId, message, type = "error") {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.style.color =
        type === "success" ? "#35d49a" : "#ff6b81";
}

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

function switchAuthForm(type) {
    if (!loginForm || !signupForm) return;

    const isLogin = type === "login";

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

if (loginForm && signupForm) {
    switchAuthForm("login");
}

/* =========================================
   SIGNUP
========================================= */

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
            window.location.hash = "#dashboard";
            window.location.reload();
        }, 700);
    });
}

/* =========================================
   LOGIN
========================================= */

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
            window.location.hash = "#dashboard";
            window.location.reload();
        }, 500);
    });
}

/* =========================================
   LOGOUT
========================================= */

function logoutNexora() {
    localStorage.removeItem(AUTH_KEYS.currentUser);
    window.location.hash = "#auth";
    window.location.reload();
}

window.logoutNexora = logoutNexora;

document.addEventListener("click", function (event) {
    const logoutButton = event.target.closest("#logoutButton");

    if (logoutButton) {
        event.preventDefault();
        logoutNexora();
    }
});

/* =========================================
   NEXORA NAVIGATION
========================================= */

function renderNexoraNavigation(page) {
    const navigationGroups = [
        {
            heading: "WORKSPACE",
            links: [
                { name: "Dashboard", icon: "⌂", page: "dashboard" },
                { name: "Discover Creators", icon: "◉", page: "creators" },
                { name: "Explore Projects", icon: "▦", page: "projects" },
                { name: "Post a Project", icon: "＋", page: "post-project" },
                { name: "My Projects", icon: "▣", page: "my-projects" }
            ]
        },
        {
            heading: "COLLABORATION",
            links: [
                { name: "Collaborations", icon: "♧", page: "collaborations" },
                { name: "Messages", icon: "✉", page: "messages" },
                { name: "Notifications", icon: "♢", page: "notifications" }
            ]
        },
        {
            heading: "ACCOUNT",
            links: [
                { name: "My Profile", icon: "◎", page: "profile" },
                { name: "Edit Profile", icon: "✎", page: "edit-profile" },
                { name: "Settings", icon: "⚙", page: "settings" },
                { name: "Moderation", icon: "⚑", page: "moderation" }
            ]
        }
    ];

    const sidebar = document.getElementById("sidebar");
    const topbar = document.getElementById("topbar");

    if (!sidebar || !topbar) return;

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("collabCurrentUser")) || {
                name: "Guest User",
                email: "guest@example.com"
            };
        } catch {
            return {
                name: "Guest User",
                email: "guest@example.com"
            };
        }
    }

    const user = getCurrentUser();

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getInitials(name) {
        return String(name || "Guest User")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "GU";
    }

    let sidebarHTML = `
        <div class="sidebar-brand">
            <div class="brand-icon">N</div>
            <span class="brand-name">Nexora</span>
            <button
                class="desktop-collapse"
                id="desktopCollapse"
                type="button"
                title="Collapse Sidebar"
                aria-label="Collapse sidebar"
            >←</button>
        </div>
        <nav class="sidebar-nav">
    `;

    navigationGroups.forEach(group => {
        sidebarHTML += `
            <div class="menu-heading">${group.heading}</div>
        `;

        group.links.forEach(link => {
            const activeClass = page === link.page ? "active" : "";

            sidebarHTML += `
                <a
                    href="#${link.page}"
                    class="nav-link ${activeClass}"
                    title="${link.name}"
                    ${page === link.page ? 'aria-current="page"' : ""}
                >
                    <span class="nav-icon">${link.icon}</span>
                    <span class="nav-label">${link.name}</span>
                </a>
            `;
        });
    });

    sidebarHTML += `
        </nav>
        <div class="sidebar-user">
            <div class="user-avatar">${getInitials(user.name)}</div>
            <div class="user-details">
                <strong>${escapeHTML(user.name)}</strong>
                <span>${escapeHTML(user.email)}</span>
            </div>
        </div>
    `;

    sidebar.innerHTML = sidebarHTML;

    const pageTitles = {
        dashboard: "Dashboard",
        creators: "Discover Creators",
        projects: "Explore Projects",
        "post-project": "Post a Project",
        "my-projects": "My Projects",
        collaborations: "Collaborations",
        messages: "Messages",
        notifications: "Notifications",
        profile: "My Profile",
        "edit-profile": "Edit Profile",
        settings: "Settings",
        moderation: "Moderation Centre"
    };

    topbar.innerHTML = `
        <div class="topbar-left">
            <button
                class="mobile-menu-button"
                id="sidebarToggle"
                type="button"
                aria-label="Open navigation"
            >☰</button>
            <h2>${pageTitles[page] || "Nexora"}</h2>
        </div>
        <div class="topbar-right">
            <a
                href="#notifications"
                class="topbar-icon"
                title="Notifications"
                aria-label="Notifications"
            >♢</a>
            <a href="#profile" title="My Profile">
                <div class="topbar-avatar">
                    ${getInitials(user.name)}
                </div>
            </a>
        </div>
    `;

    const desktopCollapse =
        document.getElementById("desktopCollapse");

    const savedCollapsedState =
        localStorage.getItem("collabSidebarCollapsed") === "true";

    if (savedCollapsedState) {
        sidebar.classList.add("collapsed");
        if (desktopCollapse) {
            desktopCollapse.textContent = "☰";
            desktopCollapse.title = "Expand Sidebar";
        }
    }

    desktopCollapse?.addEventListener("click", function () {
        sidebar.classList.toggle("collapsed");

        const isCollapsed =
            sidebar.classList.contains("collapsed");

        localStorage.setItem(
            "collabSidebarCollapsed",
            isCollapsed
        );

        desktopCollapse.textContent = isCollapsed ? "☰" : "←";
        desktopCollapse.title =
            isCollapsed ? "Expand Sidebar" : "Collapse Sidebar";
    });

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const overlay =
        document.getElementById("sidebarOverlay");

    function openMobileSidebar() {
        sidebar.classList.add("mobile-open");
        overlay?.classList.add("visible");
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("mobile-open");
        overlay?.classList.remove("visible");
    }

    sidebarToggle?.addEventListener("click", openMobileSidebar);
    overlay?.addEventListener("click", closeMobileSidebar);

    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", closeMobileSidebar);
    });
}

/* =========================================
   SINGLE-PAGE ROUTER
========================================= */

function getNexoraRoute() {
    const route = window.location.hash.replace(/^#/, "").trim();
    return route || (getCurrentAuthUser() ? "dashboard" : "auth");
}

function renderNexoraRoute() {
    const route = getNexoraRoute();
    const authView = document.getElementById("authView");
    const appView = document.getElementById("appView");

    if (route === "auth" || !getCurrentAuthUser()?.id) {
        if (authView) authView.hidden = false;
        if (appView) appView.hidden = true;
        document.body.classList.add("auth-page");
        return;
    }

    if (authView) authView.hidden = true;
    if (appView) appView.hidden = false;

    document.body.classList.remove("auth-page");

    document.querySelectorAll(".spa-view").forEach(section => {
        section.hidden = section.dataset.view !== route;
    });

    renderNexoraNavigation(route);
    window.initializeNexoraPage?.(route);
}

window.addEventListener("hashchange", renderNexoraRoute);
document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. STORAGE AND APPLICATION SETUP
    // ==========================================

    const KEYS = {
        users: "collabUsers",
        currentUser: "collabCurrentUser",
        projects: "collabProjects",
        requests: "collabRequests",
        messages: "collabMessages",
        notifications: "collabNotifications",
        reports: "collabReports",
        ratings: "collabRatings",
        activity: "collabActivity",
        settings: "collabSettings"
    };

    function read(key, fallback = []) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null ? fallback : value;
        } catch {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    const user = read(KEYS.currentUser, null);
    if (!user) return;

    const userId = user.id;
    let page = window.location.hash.slice(1) || "dashboard";

    // ==========================================
    // 2. COMMON HELPERS
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function makeId(prefix = "item") {
        return prefix + "_" + Date.now() + "_" +
            Math.random().toString(36).slice(2, 8);
    }

    function getProfile(id) {
        const profile = read("collabProfile_" + id, null);
        if (profile) return profile;

        const account = read(KEYS.users, [])
            .find(item => item.id === id);

        if (!account) return null;

        return {
            id: account.id,
            name: account.name,
            email: account.email,
            headline: "Nexora Creator",
            location: "",
            about: "",
            skills: [],
            portfolio: "",
            availability: "Available"
        };
    }

    function saveProfile(profile) {
        write("collabProfile_" + profile.id, profile);
    }

    function initials(name) {
        return String(name || "Creator")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join("");
    }

    function formatDate(date) {
        if (!date) return "No date";

        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
            ? "No date"
            : parsed.toLocaleDateString("en-IN");
    }

    function showToast(message) {
        document.querySelector(".toast")?.remove();

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || "";
    }

    function setChecked(id, value) {
        const element = document.getElementById(id);
        if (element) element.checked = value;
    }

    function getUserName(id) {
        return getProfile(id)?.name || "Unknown Creator";
    }

    function getUserProjects() {
        return read(KEYS.projects, []).filter(project =>
            String(project.ownerId || project.creatorId) === String(userId)
        );
    }

    function getUserRequests() {
        return read(KEYS.requests, []).filter(request =>
            request.senderId === userId ||
            request.receiverId === userId
        );
    }

    function getUserMessages() {
        return read(KEYS.messages, []).filter(message =>
            message.senderId === userId ||
            message.receiverId === userId
        );
    }

    function addActivity(message, icon = "✦") {
        const activities = read(KEYS.activity, []);

        activities.unshift({
            id: makeId("activity"),
            userId,
            message,
            icon,
            date: new Date().toISOString()
        });

        write(KEYS.activity, activities.slice(0, 50));
    }

    function addNotification(targetUserId, message, type = "general") {
        const notifications = read(KEYS.notifications, []);

        notifications.unshift({
            id: makeId("notification"),
            userId: targetUserId,
            message,
            type,
            read: false,
            date: new Date().toISOString()
        });

        write(KEYS.notifications, notifications);
    }

    // ==========================================
    // 3. DEMO CREATOR PROFILES
    // ==========================================

    function seedDemoCreators() {
        const demos = [
            {
                id: "demo_1",
                name: "Aarav Sharma",
                headline: "Full Stack Developer",
                location: "Delhi, India",
                about: "I enjoy building useful web applications and working with creative teams.",
                skills: ["HTML", "CSS", "JavaScript", "Web Development"],
                portfolio: "https://github.com/",
                availability: "Available"
            },
            {
                id: "demo_2",
                name: "Ananya Verma",
                headline: "UI/UX Designer",
                location: "Mumbai, India",
                about: "Passionate about clean interfaces and user-centred design.",
                skills: ["UI/UX Design", "Figma", "Graphic Design"],
                portfolio: "https://www.behance.net/",
                availability: "Available"
            },
            {
                id: "demo_3",
                name: "Rohan Mehta",
                headline: "Data Science Student",
                location: "Bengaluru, India",
                about: "Interested in machine learning, analytics and intelligent applications.",
                skills: ["Python", "Data Science", "Machine Learning"],
                portfolio: "https://github.com/",
                availability: "Busy"
            },
            {
                id: "demo_4",
                name: "Ishita Kapoor",
                headline: "Content Creator",
                location: "Pune, India",
                about: "I create digital content and help brands communicate their ideas.",
                skills: ["Content Writing", "Marketing", "Video Editing"],
                portfolio: "https://www.behance.net/",
                availability: "Available"
            },
            {
                id: "demo_5",
                name: "Kabir Singh",
                headline: "Frontend Developer",
                location: "Chandigarh, India",
                about: "Building responsive websites and interactive experiences.",
                skills: ["HTML", "CSS", "JavaScript", "React"],
                portfolio: "https://github.com/",
                availability: "Available"
            },
            {
                id: "demo_6",
                name: "Meera Nair",
                headline: "Graphic Designer",
                location: "Kochi, India",
                about: "Visual designer interested in branding and creative projects.",
                skills: ["Graphic Design", "Figma", "UI/UX Design"],
                portfolio: "https://www.behance.net/",
                availability: "Available"
            }
        ];

        demos.forEach(profile => {
            if (!localStorage.getItem("collabProfile_" + profile.id)) {
                saveProfile(profile);
            }
        });

        localStorage.setItem("collabDemoCreatorsSeeded", "true");
    }

    seedDemoCreators();

    function getAllCreators() {
        const users = read(KEYS.users, []);

        const realProfiles = users
            .map(account => getProfile(account.id))
            .filter(Boolean);

        const demoProfiles = [
            "demo_1", "demo_2", "demo_3",
            "demo_4", "demo_5", "demo_6"
        ].map(getProfile).filter(Boolean);

        return [...realProfiles, ...demoProfiles]
            .filter(profile => profile.id !== userId);
    }

    // ==========================================
    // 4. DEMO PROJECTS
    // ==========================================

    function seedNexoraDemoProjects() {
        const seedKey = "nexoraDemoProjectsSeeded";
        if (localStorage.getItem(seedKey)) return;

        const projects = read(KEYS.projects, []);

        const demos = [
            {
                id: "nexora_demo_project_1",
                ownerId: "demo_1",
                title: "AI-Powered Student Productivity Platform",
                description: "Build a platform that helps students manage tasks, track study habits and generate smart study schedules.",
                category: "Web Development",
                teamSize: 4,
                skills: ["HTML", "CSS", "JavaScript", "Python"],
                deadline: "2026-12-20",
                status: "open"
            },
            {
                id: "nexora_demo_project_2",
                ownerId: "demo_2",
                title: "Redesign a Modern E-Learning Dashboard",
                description: "Design a clean and responsive dashboard for an online learning platform with an intuitive user experience.",
                category: "UI/UX Design",
                teamSize: 3,
                skills: ["UI/UX Design", "Figma", "Graphic Design"],
                deadline: "2026-12-15",
                status: "open"
            },
            {
                id: "nexora_demo_project_3",
                ownerId: "demo_3",
                title: "Campus Placement Data Analyzer",
                description: "Develop a data analysis tool that studies placement trends, salary patterns and student performance.",
                category: "Data Science",
                teamSize: 3,
                skills: ["Python", "Data Science", "Machine Learning"],
                deadline: "2026-12-25",
                status: "open"
            },
            {
                id: "nexora_demo_project_4",
                ownerId: "demo_4",
                title: "Digital Storytelling and Content Campaign",
                description: "Create a digital content campaign with engaging stories, short-form videos and a consistent brand identity.",
                category: "Content Creation",
                teamSize: 4,
                skills: ["Content Writing", "Marketing", "Video Editing"],
                deadline: "2026-12-18",
                status: "open"
            },
            {
                id: "nexora_demo_project_5",
                ownerId: "demo_5",
                title: "Community Collaboration Web App",
                description: "Build a responsive web application where people can discover communities, share ideas and collaborate.",
                category: "Web Development",
                teamSize: 4,
                skills: ["HTML", "CSS", "JavaScript", "React"],
                deadline: "2026-12-30",
                status: "open"
            }
        ];

        const existingIds = new Set(projects.map(project => project.id));

        const newProjects = demos
            .filter(project => !existingIds.has(project.id))
            .map(project => ({
                ...project,
                createdAt: new Date().toISOString()
            }));

        write(KEYS.projects, [...projects, ...newProjects]);
        localStorage.setItem(seedKey, "true");
    }

    seedNexoraDemoProjects();

    // ==========================================
    // 5. SKILL MATCHING
    // ==========================================

    function calculateSkillMatch(requiredSkills, creatorSkills) {
        if (!requiredSkills?.length || !creatorSkills?.length) return 0;

        const required = requiredSkills.map(skill =>
            String(skill).trim().toLowerCase()
        );

        const available = creatorSkills.map(skill =>
            String(skill).trim().toLowerCase()
        );

        const matched = required.filter(skill =>
            available.includes(skill)
        );

        return Math.round((matched.length / required.length) * 100);
    }

    function getBestMatches(skills) {
        return getAllCreators()
            .map(creator => ({
                creator,
                score: calculateSkillMatch(
                    skills,
                    creator.skills || []
                )
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    // ==========================================
    // 6. DASHBOARD
    // ==========================================

    function renderDashboard() {
        const projects = getUserProjects();
        const requests = getUserRequests();
        const messages = getUserMessages();

        const notifications = read(KEYS.notifications, [])
            .filter(item => item.userId === userId && !item.read);

        setText("totalProjects", projects.length);

        setText(
            "totalCollaborations",
            requests.filter(item => item.status === "accepted").length
        );

        setText("totalMessages", messages.length);
        setText("totalNotifications", notifications.length);

        const container = document.getElementById("recentActivity");
        if (!container) return;

        const activities = read(KEYS.activity, [])
            .filter(item => item.userId === userId)
            .slice(0, 6);

        container.innerHTML = activities.length
            ? activities.map(item => `
                <div class="activity-item">
                    <div class="activity-icon">${escapeHTML(item.icon)}</div>
                    <div>
                        <p>${escapeHTML(item.message)}</p>
                        <small>${formatDate(item.date)}</small>
                    </div>
                </div>
            `).join("")
            : `<p class="empty-state">Your recent activity will appear here.</p>`;
    }
        // ==========================================
    // 7. CREATOR DISCOVERY
    // ==========================================

    function renderCreators() {
        const grid = document.getElementById("creatorGrid");
        if (!grid) return;

        const search = (
            document.getElementById("creatorSearch")?.value || ""
        ).toLowerCase().trim();

        const skillFilter = (
            document.getElementById("creatorSkillFilter")?.value || ""
        ).toLowerCase();

        const mySkills = getProfile(userId)?.skills || [];
        const requests = read(KEYS.requests, []);

        const creators = getAllCreators()
            .filter(creator => {
                const searchable = `
                    ${creator.name}
                    ${creator.headline}
                    ${creator.location}
                    ${creator.about}
                    ${(creator.skills || []).join(" ")}
                `.toLowerCase();

                const matchesSearch = searchable.includes(search);

                const matchesSkill = !skillFilter ||
                    (creator.skills || []).some(item =>
                        item.toLowerCase() === skillFilter
                    );

                return matchesSearch && matchesSkill;
            })
            .map(creator => ({
                ...creator,
                matchScore: calculateSkillMatch(
                    mySkills,
                    creator.skills || []
                )
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        if (!creators.length) {
            grid.innerHTML = `
                <p class="empty-state">
                    No creators found. Try another search.
                </p>`;
            return;
        }

        grid.innerHTML = creators.map(creator => {
            const connection = requests.find(request =>
                request.type === "connection" &&
                request.senderId === userId &&
                request.receiverId === creator.id &&
                request.status !== "rejected"
            );

            const isConnected = connection?.status === "accepted";
            const isPending = connection?.status === "pending";

            const available =
                (creator.availability || "").toLowerCase() === "available";

            return `
                <article class="creator-card nexora-creator-card">
                    <div class="creator-card-top">
                        <div class="creator-avatar nexora-creator-avatar">
                            ${escapeHTML(initials(creator.name))}
                        </div>

                        <span class="status ${available
                            ? "status-open"
                            : "status-pending"}">
                            ${escapeHTML(creator.availability || "Unknown")}
                        </span>
                    </div>

                    <h3>${escapeHTML(creator.name)}</h3>

                    <p class="creator-headline">
                        ${escapeHTML(creator.headline || "Creator")}
                    </p>

                    <p class="creator-location">
                        📍 ${escapeHTML(creator.location || "Location not added")}
                    </p>

                    <p class="creator-about">
                        ${escapeHTML(
                            creator.about || "No introduction added yet."
                        )}
                    </p>

                    <div class="creator-skills-section">
                        <small>SKILLS</small>
                        <div class="tag-list">
                            ${(creator.skills || []).map(item =>
                                `<span class="tag">${escapeHTML(item)}</span>`
                            ).join("")}
                        </div>
                    </div>

                    <div class="creator-match-box">
                        <div class="creator-match-heading">
                            <span>Skill compatibility</span>
                            <strong>${creator.matchScore}%</strong>
                        </div>

                        <div class="project-match-track">
                            <div class="project-match-fill"
                                style="width:${creator.matchScore}%"></div>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button
                            class="btn btn-primary"
                            data-action="connect"
                            data-id="${escapeHTML(creator.id)}"
                            ${isPending || isConnected ? "disabled" : ""}
                        >
                            ${isConnected
                                ? "Connected ✓"
                                : isPending
                                    ? "Request Pending"
                                    : "Connect"}
                        </button>

                        <button
                            class="btn btn-secondary"
                            data-action="view-creator"
                            data-id="${escapeHTML(creator.id)}"
                        >
                            View Profile
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    document.getElementById("creatorSearch")
        ?.addEventListener("input", renderCreators);

    document.getElementById("creatorSkillFilter")
        ?.addEventListener("change", renderCreators);

    // ==========================================
    // 8. PROJECT MARKETPLACE
    // ==========================================

    function renderProjects() {
        const grid = document.getElementById("projectGrid");
        if (!grid) return;

        const search = (
            document.getElementById("projectSearch")?.value || ""
        ).toLowerCase().trim();

        const category = (
            document.getElementById("projectCategoryFilter")?.value || ""
        ).toLowerCase();

        const allProjects = read(KEYS.projects, []);

        const projects = allProjects.filter(project => {
            const skills = Array.isArray(project.skills)
                ? project.skills
                : project.skill ? [project.skill] : [];

            const ownerId = project.ownerId || project.creatorId;

            const searchable = `
                ${project.title || ""}
                ${project.description || ""}
                ${skills.join(" ")}
                ${project.category || ""}
                ${getUserName(ownerId)}
            `.toLowerCase();

            return searchable.includes(search) &&
                (!category ||
                    (project.category || "").toLowerCase() === category) &&
                project.status !== "closed";
        });

        if (!projects.length) {
            grid.innerHTML = `
                <p class="empty-state">
                    No projects found. Try another search!
                </p>`;
            return;
        }

        const mySkills = getProfile(userId)?.skills || [];

        grid.innerHTML = projects.map(project => {
            const ownerId = project.ownerId || project.creatorId;

            const skills = Array.isArray(project.skills)
                ? project.skills
                : project.skill ? [project.skill] : [];

            const isOwner = String(ownerId) === String(userId);

            const alreadyRequested = read(KEYS.requests, []).some(request =>
                request.projectId === project.id &&
                request.senderId === userId &&
                request.status !== "rejected"
            );

            const matchScore = calculateSkillMatch(mySkills, skills);
            const ownerName = project.creatorName || getUserName(ownerId);

            const deadlineText = project.deadline
                ? formatDate(project.deadline + "T00:00:00")
                : "Flexible";

            const postedText = project.createdAt
                ? formatDate(project.createdAt)
                : "Recently";

            return `
                <article class="project-card nexora-project-card">
                    <div class="project-card-top">
                        <span class="project-category-badge">
                            ${escapeHTML(project.category || "Other")}
                        </span>

                        <span class="status status-open">
                            ${escapeHTML(project.status || "open")}
                        </span>
                    </div>

                    <h3>${escapeHTML(project.title || "Untitled Project")}</h3>

                    <p class="project-description">
                        ${escapeHTML(project.description || "")}
                    </p>

                    <div class="project-owner">
                        <div class="project-owner-avatar">
                            ${escapeHTML(initials(ownerName))}
                        </div>
                        <div>
                            <strong>${escapeHTML(ownerName)}</strong>
                            <small>Project creator</small>
                        </div>
                    </div>

                    <div class="project-skills-section">
                        <small>REQUIRED SKILLS</small>
                        <div class="tag-list">
                            ${skills.map(skill =>
                                `<span class="tag">${escapeHTML(skill)}</span>`
                            ).join("")}
                        </div>
                    </div>

                    <div class="project-info-grid">
                        <div>
                            <small>TEAM SIZE</small>
                            <strong>👥 ${Number(project.teamSize) || 1} members</strong>
                        </div>

                        <div>
                            <small>DEADLINE</small>
                            <strong>📅 ${escapeHTML(deadlineText)}</strong>
                        </div>

                        <div>
                            <small>POSTED</small>
                            <strong>${escapeHTML(postedText)}</strong>
                        </div>
                    </div>

                    ${matchScore > 0 ? `
                        <div class="project-match">
                            <div class="project-match-heading">
                                <small>Your skill match</small>
                                <strong>${matchScore}%</strong>
                            </div>

                            <div class="project-match-track">
                                <div class="project-match-fill"
                                    style="width:${matchScore}%"></div>
                            </div>
                        </div>
                    ` : ""}

                    <div class="card-actions">
                        ${isOwner
                            ? `<span class="status status-pending">Your Project</span>`
                            : `<button
                                class="btn btn-primary"
                                data-action="join-project"
                                data-id="${escapeHTML(project.id)}"
                                ${alreadyRequested ? "disabled" : ""}
                            >
                                ${alreadyRequested
                                    ? "Request Sent"
                                    : "Request to Join"}
                            </button>`
                        }
                    </div>
                </article>
            `;
        }).join("");
    }

    document.getElementById("projectSearch")
        ?.addEventListener("input", renderProjects);

    document.getElementById("projectCategoryFilter")
        ?.addEventListener("change", renderProjects);
            // ==========================================
    // 9. POST PROJECT
    // ==========================================

    document.getElementById("postProjectForm")
        ?.addEventListener("submit", function (event) {
            event.preventDefault();

            const title =
                document.getElementById("projectTitle").value.trim();

            const description =
                document.getElementById("projectDescription").value.trim();

            const category =
                document.getElementById("projectCategory").value;

            const teamSize =
                Number(document.getElementById("projectTeamSize").value);

            const skills =
                document.getElementById("projectSkills").value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);

            const deadline =
                document.getElementById("projectDeadline").value;

            if (!title || !description || !category || !skills.length) {
                showToast("Please complete all required fields.");
                return;
            }

            if (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 50) {
                showToast("Please enter a valid team size.");
                return;
            }

            const projects = read(KEYS.projects, []);

            projects.unshift({
                id: makeId("project"),
                ownerId: userId,
                title,
                description,
                category,
                teamSize,
                skills,
                deadline,
                status: "open",
                createdAt: new Date().toISOString()
            });

            write(KEYS.projects, projects);
            addActivity(`You published "${title}".`, "📁");

            showToast("Project published successfully!");

            setTimeout(() => {
                window.location.hash = "#my-projects";
            }, 700);
        });

    // ==========================================
    // 10. MY PROJECTS
    // ==========================================

    function renderMyProjects() {
        const container = document.getElementById("myProjectsList");
        if (!container) return;

        const projects = getUserProjects();
        const requests = read(KEYS.requests, []);

        setText("myProjectCount", projects.length);

        setText(
            "openProjectCount",
            projects.filter(p => p.status === "open").length
        );

        const projectIds = projects.map(p => p.id);

        const requestCount = requests.filter(request =>
            projectIds.includes(request.projectId) &&
            request.status === "pending"
        ).length;

        setText("projectRequestCount", requestCount);

        if (!projects.length) {
            container.innerHTML = `
                <p class="empty-state">
                    You haven't posted any projects yet.
                </p>`;
            return;
        }

        container.innerHTML = projects.map(project => {
            const skills = Array.isArray(project.skills)
                ? project.skills
                : project.skill ? [project.skill] : [];

            return `
                <article class="project-card">
                    <span class="status ${project.status === "open"
                        ? "status-open" : "status-closed"}">
                        ${escapeHTML(project.status || "open")}
                    </span>

                    <h3>${escapeHTML(project.title)}</h3>
                    <p>${escapeHTML(project.description)}</p>
                    <p>Category: ${escapeHTML(project.category)}</p>
                    <p>Required skills: ${skills.map(escapeHTML).join(", ")}</p>
                    <p>Deadline: ${escapeHTML(project.deadline || "Not specified")}</p>

                    <div class="card-actions">
                        <button class="btn btn-secondary"
                            data-action="toggle-project"
                            data-id="${escapeHTML(project.id)}">
                            ${project.status === "open"
                                ? "Close Project" : "Reopen Project"}
                        </button>

                        <button class="btn btn-danger"
                            data-action="delete-project"
                            data-id="${escapeHTML(project.id)}">
                            Delete
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    // ==========================================
    // 11. COLLABORATION REQUESTS
    // ==========================================

    function renderCollaborations() {
        const incoming = document.getElementById("incomingRequests");
        const sent = document.getElementById("sentRequests");
        const active = document.getElementById("activeCollaborations");

        if (!incoming || !sent || !active) return;

        const requests = read(KEYS.requests, []);
        const projects = read(KEYS.projects, []);

        const incomingRequests = requests.filter(request =>
            request.receiverId === userId &&
            request.status === "pending"
        );

        const sentRequests = requests.filter(request =>
            request.senderId === userId
        );

        const activeRequests = requests.filter(request =>
            (request.senderId === userId ||
                request.receiverId === userId) &&
            request.status === "accepted"
        );

        setText("incomingCount", incomingRequests.length);
        setText("sentCount", sentRequests.length);
        setText("activeCount", activeRequests.length);

        incoming.innerHTML = incomingRequests.length
            ? incomingRequests.map(request => {
                const project = projects.find(p =>
                    p.id === request.projectId
                );

                const isProject = request.type === "project";

                return `
                    <div class="request-item">
                        <div>
                            <p>
                                <strong>${escapeHTML(getUserName(request.senderId))}</strong>
                                ${isProject
                                    ? `wants to join <strong>${escapeHTML(project?.title || "your project")}</strong>.`
                                    : "sent you a connection request."}
                            </p>
                            <small>${formatDate(request.date)}</small>
                        </div>

                        <div class="request-actions">
                            <button class="btn btn-primary"
                                data-action="accept-request"
                                data-id="${escapeHTML(request.id)}">
                                Accept
                            </button>

                            <button class="btn btn-danger"
                                data-action="reject-request"
                                data-id="${escapeHTML(request.id)}">
                                Reject
                            </button>
                        </div>
                    </div>
                `;
            }).join("")
            : `<p class="empty-state">No incoming requests.</p>`;

        sent.innerHTML = sentRequests.length
            ? sentRequests.map(request => {
                const project = projects.find(p =>
                    p.id === request.projectId
                );

                return `
                    <div class="request-item">
                        <div>
                            <p>
                                ${request.type === "project"
                                    ? `Request to join <strong>${escapeHTML(project?.title || "a project")}</strong>`
                                    : `Connection request to <strong>${escapeHTML(getUserName(request.receiverId))}</strong>`}
                            </p>
                            <small>${formatDate(request.date)}</small>
                        </div>
                        <span class="status status-pending">
                            ${escapeHTML(request.status)}
                        </span>
                    </div>
                `;
            }).join("")
            : `<p class="empty-state">You haven't sent any requests.</p>`;

        active.innerHTML = activeRequests.length
            ? activeRequests.map(request => {
                const otherId = request.senderId === userId
                    ? request.receiverId
                    : request.senderId;

                return `
                    <div class="request-item">
                        <div>
                            <p>
                                Collaboration with
                                <strong>${escapeHTML(getUserName(otherId))}</strong>
                            </p>
                            <small>Accepted collaboration</small>
                        </div>
                        <a href="#messages" class="btn btn-secondary">
                            Message
                        </a>
                    </div>
                `;
            }).join("")
            : `<p class="empty-state">No active collaborations yet.</p>`;
    }

    // ==========================================
    // 12. MESSAGING SYSTEM
    // ==========================================

    let selectedConversation = null;

    function getConversations() {
        const ids = new Set();

        getUserMessages().forEach(message => {
            ids.add(
                message.senderId === userId
                    ? message.receiverId
                    : message.senderId
            );
        });

        return [...ids];
    }

    function renderMessages() {
        const list = document.getElementById("conversationList");
        if (!list) return;

        const search = (
            document.getElementById("conversationSearch")?.value || ""
        ).toLowerCase();

        const conversations = getConversations().filter(id =>
            getUserName(id).toLowerCase().includes(search)
        );

        list.innerHTML = conversations.length
            ? conversations.map(id => `
                <div class="conversation-item ${
                    selectedConversation === id ? "active" : ""
                }"
                    data-action="open-conversation"
                    data-id="${escapeHTML(id)}">

                    <div class="user-avatar">
                        ${escapeHTML(initials(getUserName(id)))}
                    </div>

                    <div>
                        <h4>${escapeHTML(getUserName(id))}</h4>
                        <p>Open conversation</p>
                    </div>
                </div>
            `).join("")
            : `<p class="empty-state">No conversations yet.</p>`;

        renderChat();
    }

    function renderChat() {
        const header = document.getElementById("chatHeader");
        const container = document.getElementById("chatMessages");
        const input = document.getElementById("messageInput");
        const button = document.getElementById("sendMessageButton");

        if (!header || !container) return;

        if (!selectedConversation) {
            header.innerHTML = "<h2>Select a conversation</h2>";

            container.innerHTML = `
                <p class="empty-state">
                    Choose a conversation to view messages.
                </p>`;

            if (input) input.disabled = true;
            if (button) button.disabled = true;
            return;
        }

        header.innerHTML = `
            <h2>${escapeHTML(getUserName(selectedConversation))}</h2>
        `;

        if (input) input.disabled = false;
        if (button) button.disabled = false;

        const messages = read(KEYS.messages, []).filter(message =>
            (message.senderId === userId &&
                message.receiverId === selectedConversation) ||
            (message.senderId === selectedConversation &&
                message.receiverId === userId)
        );

        container.innerHTML = messages.length
            ? messages.map(message => `
                <div class="message-bubble ${
                    message.senderId === userId ? "sent" : ""
                }">
                    ${escapeHTML(message.text)}
                    <small>${formatDate(message.date)}</small>
                </div>
            `).join("")
            : `<p class="empty-state">Start the conversation!</p>`;

        container.scrollTop = container.scrollHeight;
    }

    document.getElementById("conversationSearch")
        ?.addEventListener("input", renderMessages);

    document.getElementById("messageForm")
        ?.addEventListener("submit", function (event) {
            event.preventDefault();

            const input = document.getElementById("messageInput");
            const messageText = input.value.trim();

            if (!selectedConversation || !messageText) return;

            const messages = read(KEYS.messages, []);

            messages.push({
                id: makeId("message"),
                senderId: userId,
                receiverId: selectedConversation,
                text: messageText,
                date: new Date().toISOString()
            });

            write(KEYS.messages, messages);

            addNotification(
                selectedConversation,
                `${user.name} sent you a message.`,
                "message"
            );

            input.value = "";
            renderChat();
            showToast("Message sent!");
        });
            // ==========================================
    // 13. NOTIFICATIONS
    // ==========================================

    function renderNotifications() {
        const container = document.getElementById("notificationList");
        if (!container) return;

        const notifications = read(KEYS.notifications, [])
            .filter(item => item.userId === userId);

        const unread = notifications.filter(item => !item.read);

        setText("unreadCount", `${unread.length} unread`);

        container.innerHTML = notifications.length
            ? notifications.map(item => `
                <div class="notification-item ${
                    item.read ? "" : "unread"
                }">
                    <div>
                        <p>${escapeHTML(item.message)}</p>
                        <small>${formatDate(item.date)}</small>
                    </div>

                    ${!item.read
                        ? `<button class="btn btn-secondary"
                            data-action="read-notification"
                            data-id="${escapeHTML(item.id)}">
                            Mark Read
                           </button>`
                        : `<span class="status status-open">Read</span>`
                    }
                </div>
            `).join("")
            : `<p class="empty-state">You're all caught up!</p>`;
    }

    document.getElementById("markAllRead")
        ?.addEventListener("click", function () {
            const notifications = read(KEYS.notifications, []).map(item =>
                item.userId === userId
                    ? { ...item, read: true }
                    : item
            );

            write(KEYS.notifications, notifications);
            renderNotifications();
            showToast("All notifications marked as read.");
        });

    // ==========================================
    // 14. PROFILE DISPLAY
    // ==========================================

    function renderProfile() {
        const profile = getProfile(userId);
        if (!profile) return;

        setText("profileName", profile.name);
        setText("profileHeadline", profile.headline || "Creator on Nexora");
        setText("profileLocation", profile.location || "Location not added");
        setText(
            "profileAbout",
            profile.about || "Add an introduction to tell creators about yourself."
        );
        setText("profileAvatar", initials(profile.name));

        const skills = document.getElementById("profileSkills");

        if (skills) {
            skills.innerHTML = profile.skills?.length
                ? profile.skills.map(skill =>
                    `<span class="tag">${escapeHTML(skill)}</span>`
                ).join("")
                : `<span class="tag">No skills added</span>`;
        }

        const portfolio = document.getElementById("profilePortfolio");

        if (portfolio) {
            if (profile.portfolio) {
                try {
                    const url = new URL(profile.portfolio);

                    if (["https:", "http:"].includes(url.protocol)) {
                        portfolio.href = url.href;
                        portfolio.textContent = "Visit Portfolio";
                        portfolio.target = "_blank";
                        portfolio.rel = "noopener noreferrer";
                    } else {
                        portfolio.removeAttribute("href");
                        portfolio.textContent = "Invalid portfolio URL";
                    }
                } catch {
                    portfolio.removeAttribute("href");
                    portfolio.textContent = "Invalid portfolio URL";
                }
            } else {
                portfolio.removeAttribute("href");
                portfolio.textContent = "No portfolio link added";
            }
        }

        const ratings = read(KEYS.ratings, []).filter(
            rating => rating.targetId === userId
        );

        const average = ratings.length
            ? ratings.reduce((sum, item) => sum + Number(item.score), 0) /
                ratings.length
            : 0;

        setText(
            "profileRating",
            ratings.length
                ? `${average.toFixed(1)} / 5 (${ratings.length} ratings)`
                : "No ratings yet"
        );
    }

    // ==========================================
    // 15. EDIT PROFILE
    // ==========================================

    function loadEditProfile() {
        const profile = getProfile(userId);
        if (!profile) return;

        setValue("editName", profile.name);
        setValue("editHeadline", profile.headline);
        setValue("editLocation", profile.location);
        setValue("editAbout", profile.about);
        setValue("editSkills", (profile.skills || []).join(", "));
        setValue("editPortfolio", profile.portfolio);
        setValue("editAvailability", profile.availability);
    }

    document.getElementById("editProfileForm")
        ?.addEventListener("submit", function (event) {
            event.preventDefault();

            const profile = getProfile(userId);
            if (!profile) return;

            profile.name = document.getElementById("editName").value.trim();
            profile.headline = document.getElementById("editHeadline").value.trim();
            profile.location = document.getElementById("editLocation").value.trim();
            profile.about = document.getElementById("editAbout").value.trim();

            profile.skills = document.getElementById("editSkills").value
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);

            profile.portfolio = document.getElementById("editPortfolio").value.trim();
            profile.availability = document.getElementById("editAvailability").value;

            if (!profile.name) {
                showToast("Name cannot be empty.");
                return;
            }

            if (profile.portfolio) {
                try {
                    const url = new URL(profile.portfolio);

                    if (!["http:", "https:"].includes(url.protocol)) {
                        showToast("Use a valid HTTP or HTTPS portfolio URL.");
                        return;
                    }
                } catch {
                    showToast("Please enter a valid portfolio URL.");
                    return;
                }
            }

            saveProfile(profile);

            write(KEYS.currentUser, {
                id: userId,
                name: profile.name,
                email: user.email
            });

            const users = read(KEYS.users, []).map(account =>
                account.id === userId
                    ? { ...account, name: profile.name }
                    : account
            );

            write(KEYS.users, users);

            addActivity("You updated your creator profile.", "◉");
            showToast("Profile updated successfully!");

            setTimeout(() => {
                window.location.hash = "#profile";
            }, 700);
        });

    // ==========================================
    // 16. SETTINGS
    // ==========================================

    function applyTheme(settings) {
        document.body.classList.toggle(
            "light-theme",
            settings.darkTheme === false
        );
    }

    function loadSettings() {
        const settings = read(KEYS.settings, {});

        setChecked("darkThemeToggle", settings.darkTheme !== false);
        setChecked("emailNotificationsToggle", settings.emailNotifications !== false);
        setChecked("messageNotificationsToggle", settings.messageNotifications !== false);

        applyTheme(settings);
    }

    document.getElementById("darkThemeToggle")
        ?.addEventListener("change", function () {
            const settings = read(KEYS.settings, {});
            settings.darkTheme = this.checked;
            write(KEYS.settings, settings);
            applyTheme(settings);
        });

    document.getElementById("saveSettings")
        ?.addEventListener("click", function () {
            const settings = {
                darkTheme: document.getElementById("darkThemeToggle").checked,
                emailNotifications: document.getElementById("emailNotificationsToggle").checked,
                messageNotifications: document.getElementById("messageNotificationsToggle").checked
            };

            write(KEYS.settings, settings);
            applyTheme(settings);
            showToast("Preferences saved.");
        });

    // ==========================================
    // 17. MODERATION AND REPORTING
    // ==========================================

    function renderModeration() {
        const container = document.getElementById("moderationReports");
        if (!container) return;

        const reports = read(KEYS.reports, []);

        setText("totalReports", reports.length);
        setText(
            "pendingReports",
            reports.filter(r => r.status === "pending").length
        );
        setText(
            "resolvedReports",
            reports.filter(r => r.status === "resolved").length
        );

        container.innerHTML = reports.length
            ? reports.map(report => `
                <div class="report-item">
                    <div>
                        <p><strong>${escapeHTML(report.reason)}</strong></p>
                        <p>${escapeHTML(report.description)}</p>
                        <small>
                            Reported by ${escapeHTML(getUserName(report.reporterId))}
                            · ${formatDate(report.date)}
                        </small>
                    </div>

                    <div class="request-actions">
                        <span class="status ${
                            report.status === "resolved"
                                ? "status-open" : "status-pending"
                        }">
                            ${escapeHTML(report.status)}
                        </span>

                        ${report.status === "pending"
                            ? `<button class="btn btn-primary"
                                data-action="resolve-report"
                                data-id="${escapeHTML(report.id)}">
                                Resolve
                               </button>`
                            : ""
                        }
                    </div>
                </div>
            `).join("")
            : `<p class="empty-state">No reports to review.</p>`;
    }

    function submitReport(targetId, reason, description) {
        if (!targetId || !reason || !String(description || "").trim()) {
            showToast("Please complete the report details.");
            return;
        }

        const reports = read(KEYS.reports, []);

        reports.unshift({
            id: makeId("report"),
            reporterId: userId,
            targetId,
            reason,
            description: String(description).trim(),
            status: "pending",
            date: new Date().toISOString()
        });

        write(KEYS.reports, reports);
        addActivity("You submitted a community report.", "⚑");
        showToast("Report submitted for review.");
    }

    // ==========================================
    // 18. RATINGS AND REPUTATION
    // ==========================================

    function submitRating(targetId, score, review) {
        const numericScore = Number(score);

        if (!targetId || targetId === userId ||
            !Number.isInteger(numericScore) ||
            numericScore < 1 || numericScore > 5) {
            showToast("Please select a valid rating.");
            return;
        }

        const ratings = read(KEYS.ratings, []);

        const alreadyRated = ratings.some(rating =>
            rating.reviewerId === userId &&
            rating.targetId === targetId
        );

        if (alreadyRated) {
            showToast("You have already rated this creator.");
            return;
        }

        ratings.push({
            id: makeId("rating"),
            reviewerId: userId,
            targetId,
            score: numericScore,
            review: String(review || "").trim().slice(0, 500),
            date: new Date().toISOString()
        });

        write(KEYS.ratings, ratings);

        addNotification(
            targetId,
            `${user.name} rated your creator profile.`,
            "rating"
        );

        showToast("Rating submitted!");
    }

    // ==========================================
    // 19. CREATOR CONNECTIONS
    // ==========================================

    function sendConnectionRequest(targetId) {
        if (!targetId || targetId === userId) return;

        const requests = read(KEYS.requests, []);

        const exists = requests.some(request =>
            request.senderId === userId &&
            request.receiverId === targetId &&
            request.type === "connection" &&
            request.status !== "rejected"
        );

        if (exists) {
            showToast("You already sent a connection request.");
            return;
        }

        requests.unshift({
            id: makeId("request"),
            senderId: userId,
            receiverId: targetId,
            projectId: null,
            type: "connection",
            status: "pending",
            date: new Date().toISOString()
        });

        write(KEYS.requests, requests);

        addNotification(
            targetId,
            `${user.name} sent you a connection request.`,
            "connection"
        );

        addActivity(
            `You sent a connection request to ${getUserName(targetId)}.`,
            "🤝"
        );

        showToast("Connection request sent!");
        renderCreators();
    }

    // ==========================================
    // 20. JOIN PROJECT REQUEST
    // ==========================================

    function joinProject(projectId) {
        const projects = read(KEYS.projects, []);

        const project = projects.find(item =>
            item.id === projectId
        );

        const ownerId = project?.ownerId || project?.creatorId;

        if (!project || String(ownerId) === String(userId)) return;

        const requests = read(KEYS.requests, []);

        const exists = requests.some(request =>
            request.projectId === projectId &&
            request.senderId === userId &&
            request.status !== "rejected"
        );

        if (exists) {
            showToast("You already requested to join this project.");
            return;
        }

        requests.unshift({
            id: makeId("request"),
            senderId: userId,
            receiverId: ownerId,
            projectId,
            type: "project",
            status: "pending",
            date: new Date().toISOString()
        });

        write(KEYS.requests, requests);

        addNotification(
            ownerId,
            `${user.name} requested to join "${project.title}".`,
            "project-request"
        );

        addActivity(`You requested to join "${project.title}".`, "🤝");

        showToast("Join request sent!");
        renderProjects();
    }

    // ==========================================
    // 21. ACCEPT / REJECT REQUESTS
    // ==========================================

    function updateRequest(requestId, status) {
        const requests = read(KEYS.requests, []);

        const request = requests.find(item =>
            item.id === requestId
        );

        if (!request ||
            request.receiverId !== userId ||
            request.status !== "pending") return;

        request.status = status;
        write(KEYS.requests, requests);

        const project = read(KEYS.projects, []).find(
            item => item.id === request.projectId
        );

        addNotification(
            request.senderId,
            request.type === "project"
                ? `Your request to join "${project?.title || "a project"}" was ${status}.`
                : `Your connection request was ${status}.`,
            "request-update"
        );

        addActivity(`You ${status} a collaboration request.`, "🤝");

        showToast(`Request ${status}.`);

        renderCollaborations();
        renderCreators();
        renderDashboard();
    }

    // ==========================================
    // 22. PROJECT MANAGEMENT
    // ==========================================

    function toggleProject(projectId) {
        const projects = read(KEYS.projects, []);

        const project = projects.find(item =>
            item.id === projectId &&
            String(item.ownerId || item.creatorId) === String(userId)
        );

        if (!project) return;

        project.status = project.status === "open"
            ? "closed"
            : "open";

        write(KEYS.projects, projects);
        renderMyProjects();

        showToast("Project status updated.");
    }

    function deleteProject(projectId) {
        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        const projects = read(KEYS.projects, []);

        const project = projects.find(item =>
            item.id === projectId &&
            String(item.ownerId || item.creatorId) === String(userId)
        );

        if (!project) return;

        write(
            KEYS.projects,
            projects.filter(item => item.id !== projectId)
        );

        write(
            KEYS.requests,
            read(KEYS.requests, []).filter(
                item => item.projectId !== projectId
            )
        );

        addActivity(`You deleted "${project.title}".`, "🗑");

        renderMyProjects();
        showToast("Project deleted.");
    }

    // ==========================================
    // 23. GLOBAL BUTTON ACTION HANDLER
    // ==========================================

    document.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        switch (action) {
            case "connect":
                sendConnectionRequest(id);

                if (document.getElementById("creatorProfileModal")) {
                    viewCreatorProfile(id);
                }
                break;

            case "close-creator-modal":
                document.getElementById("creatorProfileModal")?.remove();
                document.body.style.overflow = "";
                break;

            case "join-project":
                joinProject(id);
                break;

            case "accept-request":
                updateRequest(id, "accepted");
                break;

            case "reject-request":
                updateRequest(id, "rejected");
                break;

            case "toggle-project":
                toggleProject(id);
                break;

            case "delete-project":
                deleteProject(id);
                break;

            case "read-notification": {
                const notifications = read(KEYS.notifications, []);

                const item = notifications.find(n =>
                    n.id === id && n.userId === userId
                );

                if (item) item.read = true;

                write(KEYS.notifications, notifications);
                renderNotifications();
                renderDashboard();
                break;
            }

            case "resolve-report": {
                const reports = read(KEYS.reports, []);
                const report = reports.find(r => r.id === id);

                if (report) report.status = "resolved";

                write(KEYS.reports, reports);
                renderModeration();
                showToast("Report marked as resolved.");
                break;
            }

            case "open-conversation":
                selectedConversation = id;
                renderMessages();
                break;

            case "view-creator":
                viewCreatorProfile(id);
                break;
        }
    });

    // ==========================================
    // 24. CREATOR PROFILE VIEW
    // ==========================================

    function viewCreatorProfile(id) {
        const profile = getProfile(id);

        if (!profile) {
            showToast("Creator profile not found.");
            return;
        }

        document.getElementById("creatorProfileModal")?.remove();

        const mySkills = getProfile(userId)?.skills || [];
        const creatorSkills = profile.skills || [];

        const matchScore = calculateSkillMatch(mySkills, creatorSkills);
        const requests = read(KEYS.requests, []);

        const connection = requests.find(request =>
            request.type === "connection" &&
            request.senderId === userId &&
            request.receiverId === id &&
            request.status !== "rejected"
        );

        const isConnected = connection?.status === "accepted";
        const isPending = connection?.status === "pending";

        let portfolioHTML = "";

        if (profile.portfolio) {
            try {
                const url = new URL(profile.portfolio);

                if (["https:", "http:"].includes(url.protocol)) {
                    portfolioHTML = `
                        <a class="nexora-portfolio-link"
                           href="${escapeHTML(url.href)}"
                           target="_blank"
                           rel="noopener noreferrer">
                            <span>↗</span> Visit Portfolio
                        </a>
                    `;
                }
            } catch {
                portfolioHTML = "";
            }
        }

        const ratings = read(KEYS.ratings, []).filter(
            rating => rating.targetId === id
        );

        const averageRating = ratings.length
            ? (
                ratings.reduce((sum, rating) => sum + Number(rating.score), 0) /
                ratings.length
            ).toFixed(1)
            : "New";

        const modal = document.createElement("div");
        modal.id = "creatorProfileModal";
        modal.className = "nexora-profile-overlay";

        modal.innerHTML = `
            <div class="nexora-profile-modal">
                <button class="nexora-modal-close"
                    data-action="close-creator-modal"
                    aria-label="Close profile">
                    ✕
                </button>

                <div class="nexora-profile-cover">
                    <div class="nexora-profile-cover-glow"></div>
                    <span class="nexora-profile-cover-label">
                        NEXORA CREATOR PROFILE
                    </span>
                </div>

                <div class="nexora-profile-content">
                    <div class="nexora-profile-identity">
                        <div class="nexora-profile-avatar">
                            ${escapeHTML(initials(profile.name))}
                        </div>

                        <div class="nexora-profile-identity-info">
                            <h2>${escapeHTML(profile.name)}</h2>
                            <p>${escapeHTML(profile.headline || "Nexora Creator")}</p>
                            <span class="nexora-profile-location">
                                📍 ${escapeHTML(profile.location || "Location not added")}
                            </span>
                        </div>

                        <span class="nexora-profile-availability ${
                            (profile.availability || "").toLowerCase() === "available"
                                ? "available"
                                : ""
                        }">
                            ● ${escapeHTML(profile.availability || "Unknown")}
                        </span>
                    </div>

                    <div class="nexora-profile-stats">
                        <div class="nexora-profile-stat">
                            <strong>${matchScore}%</strong>
                            <span>Skill Match</span>
                        </div>

                        <div class="nexora-profile-stat">
                            <strong>★ ${averageRating}</strong>
                            <span>Rating</span>
                        </div>

                        <div class="nexora-profile-stat">
                            <strong>${creatorSkills.length}</strong>
                            <span>Skills</span>
                        </div>
                    </div>

                    <div class="nexora-profile-section">
                        <h3><span>✦</span> About Me</h3>
                        <p>${escapeHTML(
                            profile.about ||
                            "This creator hasn't added an introduction yet."
                        )}</p>
                    </div>

                    <div class="nexora-profile-section">
                        <h3><span>⚡</span> Skills & Expertise</h3>
                        <div class="nexora-profile-skills">
                            ${creatorSkills.length
                                ? creatorSkills.map(skill => `
                                    <span>${escapeHTML(skill)}</span>
                                `).join("")
                                : `<p>No skills added yet.</p>`
                            }
                        </div>
                    </div>

                    <div class="nexora-profile-section">
                        <h3><span>◈</span> Compatibility With You</h3>
                        <div class="nexora-profile-match-heading">
                            <span>Shared skill compatibility</span>
                            <strong>${matchScore}%</strong>
                        </div>
                        <div class="nexora-profile-match-track">
                            <div style="width:${matchScore}%"></div>
                        </div>
                    </div>

                    ${portfolioHTML ? `
                        <div class="nexora-profile-section">
                            <h3><span>↗</span> Portfolio</h3>
                            ${portfolioHTML}
                        </div>
                    ` : ""}

                    <div class="nexora-profile-actions">
                        <button
                            class="nexora-profile-connect"
                            data-action="connect"
                            data-id="${escapeHTML(id)}"
                            ${isConnected || isPending ? "disabled" : ""}
                        >
                            ${isConnected
                                ? "✓ Connected"
                                : isPending
                                    ? "Request Pending"
                                    : "＋ Connect with Creator"}
                        </button>

                        <button
                            class="nexora-profile-close-btn"
                            data-action="close-creator-modal">
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.remove();
                document.body.style.overflow = "";
            }
        });
    }

    // ==========================================
    // 25. GLOBAL FUNCTIONS
    // ==========================================

    window.collabSpaceReport = submitReport;
    window.collabSpaceRate = submitRating;
    window.collabSpaceMatches = getBestMatches;

    // ==========================================
    // 26. SPA PAGE INITIALISATION
    // ==========================================

    window.initializeNexoraPage = function (route) {
        switch (route) {
            case "dashboard":
                renderDashboard();
                break;

            case "creators":
                renderCreators();
                break;

            case "projects":
                renderProjects();
                break;

            case "my-projects":
                renderMyProjects();
                break;

            case "collaborations":
                renderCollaborations();
                break;

            case "messages":
                renderMessages();
                break;

            case "notifications":
                renderNotifications();
                break;

            case "profile":
                renderProfile();
                break;

            case "edit-profile":
                loadEditProfile();
                break;

            case "settings":
                loadSettings();
                break;

            case "moderation":
                renderModeration();
                break;
        }
    };

    // ==========================================
    // 27. CROSS-TAB DATA REFRESH
    // ==========================================

    window.addEventListener("storage", function (event) {
        if (!event.key) return;

        if ([
            KEYS.projects,
            KEYS.requests,
            KEYS.messages,
            KEYS.notifications,
            KEYS.activity,
            KEYS.reports,
            KEYS.ratings
        ].includes(event.key)) {
            window.location.reload();
        }
    });

    console.log("Nexora application loaded.");

    // Initialise the current SPA route after all renderers exist.
    renderNexoraRoute();

}); // End DOMContentLoaded