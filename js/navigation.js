
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. NAVIGATION CONFIGURATION
    // =====================================

    const navigationGroups = [
        {
            heading: "WORKSPACE",
            links: [
                { name: "Dashboard", icon: "⌂", url: "dashboard.html", page: "dashboard" },
                { name: "Discover Creators", icon: "◉", url: "creators.html", page: "creators" },
                { name: "Explore Projects", icon: "▦", url: "projects.html", page: "projects" },
                { name: "Post a Project", icon: "＋", url: "post-project.html", page: "post-project" },
                { name: "My Projects", icon: "▣", url: "my-projects.html", page: "my-projects" }
            ]
        },
        {
            heading: "COLLABORATION",
            links: [
                { name: "Collaborations", icon: "♧", url: "collaborations.html", page: "collaborations" },
                { name: "Messages", icon: "✉", url: "messages.html", page: "messages" },
                { name: "Notifications", icon: "♢", url: "notifications.html", page: "notifications" }
            ]
        },
        {
            heading: "ACCOUNT",
            links: [
                { name: "My Profile", icon: "◎", url: "profile.html", page: "profile" },
                { name: "Edit Profile", icon: "✎", url: "edit-profile.html", page: "edit-profile" },
                { name: "Settings", icon: "⚙", url: "settings.html", page: "settings" },
                { name: "Moderation", icon: "⚑", url: "moderation.html", page: "moderation" }
            ]
        }
    ];

    // =====================================
    // 2. FIND CURRENT PAGE
    // =====================================

    const currentPage = document.body.dataset.page || "dashboard";

    const sidebar = document.getElementById("sidebar");
    const topbar = document.getElementById("topbar");

    if (!sidebar || !topbar) {
        return;
    }

    // =====================================
    // 3. GET USER INFORMATION
    // =====================================

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("collabCurrentUser")) || {
                name: "Guest User",
                email: "guest@example.com"
            };
        } catch (error) {
            return {
                name: "Guest User",
                email: "guest@example.com"
            };
        }
    }

    const user = getCurrentUser();

    function getInitials(name) {
        return String(name || "Guest User")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part.charAt(0).toUpperCase())
            .join("") || "GU";
    }

    // =====================================
    // 4. GENERATE SIDEBAR
    // =====================================

    let sidebarHTML = `
        <div class="sidebar-brand">
            <div class="brand-icon">C</div>
            <span class="brand-name">CollabSpace</span>
            <button
                class="desktop-collapse"
                id="desktopCollapse"
                type="button"
                title="Collapse Sidebar"
                aria-label="Collapse sidebar"
            >☰</button>
        </div>

        <nav class="sidebar-nav">
    `;

    navigationGroups.forEach(group => {

        sidebarHTML += `
            <div class="menu-heading">${group.heading}</div>
        `;

        group.links.forEach(link => {

            const activeClass =
                currentPage === link.page ? "active" : "";

            sidebarHTML += `
                <a
                    href="${link.url}"
                    class="nav-link ${activeClass}"
                    title="${link.name}"
                    ${currentPage === link.page ? 'aria-current="page"' : ""}
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

    // =====================================
    // 5. GENERATE TOPBAR
    // =====================================

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

            <h2>${pageTitles[currentPage] || "CollabSpace"}</h2>
        </div>

        <div class="topbar-right">
            <a
                href="notifications.html"
                class="topbar-icon"
                title="Notifications"
                aria-label="Notifications"
            >♢</a>

            <a href="profile.html" title="My Profile">
                <div class="topbar-avatar">${getInitials(user.name)}</div>
            </a>
        </div>
    `;

    // =====================================
    // 6. SIDEBAR COLLAPSE ON DESKTOP
    // =====================================

    const desktopCollapse =
        document.getElementById("desktopCollapse");

    const savedCollapsedState =
        localStorage.getItem("collabSidebarCollapsed") === "true";

    if (savedCollapsedState) {
        sidebar.classList.add("collapsed");
    }

    
    if (desktopCollapse) {
    desktopCollapse.addEventListener("click", function () {

        sidebar.classList.toggle("collapsed");

        const isCollapsed =
            sidebar.classList.contains("collapsed");

        localStorage.setItem(
            "collabSidebarCollapsed",
            isCollapsed
        );

        desktopCollapse.textContent = isCollapsed ? "☰" : "←";
        desktopCollapse.title = isCollapsed
            ? "Expand Sidebar"
            : "Collapse Sidebar";
    });

    if (savedCollapsedState) {
        desktopCollapse.textContent = "☰";
        desktopCollapse.title = "Expand Sidebar";
    }
}

    // =====================================
    // 7. MOBILE SIDEBAR
    // =====================================

    const sidebarToggle =
        document.getElementById("sidebarToggle");

    const overlay =
        document.getElementById("sidebarOverlay");

    function openMobileSidebar() {
        sidebar.classList.add("mobile-open");

        if (overlay) {
            overlay.classList.add("visible");
        }
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("mobile-open");

        if (overlay) {
            overlay.classList.remove("visible");
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener(
            "click",
            openMobileSidebar
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    sidebar.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", closeMobileSidebar);
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });

    // =====================================
    // 8. HTML ESCAPE HELPER
    // =====================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    console.log("CollabSpace navigation loaded:", currentPage);

});
