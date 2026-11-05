
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. COLLABSPACE DATA SYSTEM
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

    function currentUser() {
        return read(KEYS.currentUser, null);
    }

    const user = currentUser();

    if (!user) return;

    const userId = user.id;
    const page = document.body.dataset.page;

    // ==========================================
    // 2. COMMON HELPERS
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function makeId(prefix = "item") {
        return prefix + "_" + Date.now() + "_" +
            Math.random().toString(36).slice(2, 7);
    }

    function getProfile(id) {
        const profile = read("collabProfile_" + id, null);

        if (profile) return profile;

        const account = read(KEYS.users, []).find(item => item.id === id);

        return account ? {
            id: account.id,
            name: account.name,
            email: account.email,
            headline: "CollabSpace Creator",
            location: "",
            about: "",
            skills: [],
            portfolio: "",
            availability: "Available"
        } : null;
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
        return new Date(date).toLocaleDateString();
    }

    function showToast(message) {
        document.querySelector(".toast")?.remove();

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
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

    function getUserName(id) {
        const profile = getProfile(id);
        return profile ? profile.name : "Unknown Creator";
    }

    function getUserProjects() {
        return read(KEYS.projects, []).filter(project =>
            project.ownerId === userId
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

    // ==========================================
    // 3. DEMO CREATOR PROFILES
    // ==========================================

    function seedDemoCreators() {
        if (localStorage.getItem("collabDemoCreatorsSeeded")) return;

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

        const all = [...realProfiles, ...demoProfiles];

        return all.filter(profile => profile.id !== userId);
    }

    // ==========================================
    // 4. SKILL MATCHING ALGORITHM
    // ==========================================

    function calculateSkillMatch(requiredSkills, creatorSkills) {
        if (!requiredSkills.length || !creatorSkills.length) return 0;

        const required = requiredSkills.map(skill =>
            skill.trim().toLowerCase()
        );

        const available = creatorSkills.map(skill =>
            skill.trim().toLowerCase()
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
                score: calculateSkillMatch(skills, creator.skills || [])
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    // ==========================================
    // 5. DASHBOARD
    // ==========================================

    function renderDashboard() {
        const projects = getUserProjects();
        const requests = getUserRequests();
        const messages = getUserMessages();

        const notifications = read(KEYS.notifications, [])
            .filter(item => item.userId === userId && !item.read);

        const accepted = requests.filter(item =>
            item.status === "accepted"
        );

        setText("totalProjects", projects.length);
        setText("totalCollaborations", accepted.length);
        setText("totalMessages", messages.length);
        setText("totalNotifications", notifications.length);

        const activityContainer = document.getElementById("recentActivity");

        if (!activityContainer) return;

        const activities = read(KEYS.activity, [])
            .filter(item => item.userId === userId)
            .slice(0, 6);

        activityContainer.innerHTML = activities.length
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

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    // ==========================================
    // 6. CREATOR DISCOVERY
    // ==========================================

    function renderCreators() {
        const grid = document.getElementById("creatorGrid");
        if (!grid) return;

        const search = (
            document.getElementById("creatorSearch")?.value || ""
        ).toLowerCase();

        const skill = (
            document.getElementById("creatorSkillFilter")?.value || ""
        ).toLowerCase();

        const creators = getAllCreators().filter(creator => {
            const searchable =
                `${creator.name} ${creator.headline} ${creator.about} ${(creator.skills || []).join(" ")}`
                    .toLowerCase();

            const matchesSearch = searchable.includes(search);

            const matchesSkill = !skill ||
                (creator.skills || []).some(item =>
                    item.toLowerCase() === skill
                );

            return matchesSearch && matchesSkill;
        });

        if (!creators.length) {
            grid.innerHTML = `<p class="empty-state">No creators found. Try another search.</p>`;
            return;
        }

        grid.innerHTML = creators.map(creator => {
            const match = calculateSkillMatch(
                getProfile(userId)?.skills || [],
                creator.skills || []
            );

            return `
                <article class="creator-card">
                    <div class="creator-avatar">${escapeHTML(initials(creator.name))}</div>
                    <h3>${escapeHTML(creator.name)}</h3>
                    <p>${escapeHTML(creator.headline)}</p>
                    <p>📍 ${escapeHTML(creator.location || "Location not added")}</p>
                    <div class="tag-list">
                        ${(creator.skills || []).map(skill =>
                            `<span class="tag">${escapeHTML(skill)}</span>`
                        ).join("")}
                    </div>
                    <p><strong>${match}%</strong> skill match with your profile</p>
                    <p><span class="status ${creator.availability === "Available" ? "status-open" : "status-pending"}">${escapeHTML(creator.availability || "Unknown")}</span></p>
                    <div class="card-actions">
                        <button class="btn btn-primary" data-action="connect" data-id="${escapeHTML(creator.id)}">Connect</button>
                        <button class="btn btn-secondary" data-action="view-creator" data-id="${escapeHTML(creator.id)}">View Profile</button>
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
    // 7. PROJECT MARKETPLACE
    // ==========================================

    
function renderProjects() {
    const grid = document.getElementById("projectGrid");
    if (!grid) return;

    const search = (
        document.getElementById("projectSearch")?.value || ""
    ).toLowerCase();

    const category = (
        document.getElementById("projectCategoryFilter")?.value || ""
    ).toLowerCase();

    const projects = read(KEYS.projects, []).filter(project => {
        const skills = Array.isArray(project.skills)
            ? project.skills
            : project.skill
                ? [project.skill]
                : [];

        const searchable = `
            ${project.title || ""}
            ${project.description || ""}
            ${skills.join(" ")}
            ${project.category || ""}
        `.toLowerCase();

        return searchable.includes(search) &&
            (!category ||
                (project.category || "").toLowerCase() === category) &&
            project.status !== "closed";
    });

    if (!projects.length) {
        grid.innerHTML = `
            <p class="empty-state">
                No projects found. Be the first to post one!
            </p>`;
        return;
    }

    grid.innerHTML = projects.map(project => {
        const ownerId = project.ownerId || project.creatorId;
        const skills = Array.isArray(project.skills)
            ? project.skills
            : project.skill
                ? [project.skill]
                : [];

        const alreadyRequested = read(KEYS.requests, []).some(request =>
            request.projectId === project.id &&
            request.senderId === userId
        );

        const isOwner = String(ownerId) === String(userId);

        return `
            <article class="project-card">
                <span class="status status-open">
                    ${escapeHTML(project.status || "open")}
                </span>

                <h3>${escapeHTML(project.title || "Untitled Project")}</h3>

                <p>${escapeHTML(project.description || "")}</p>

                <p>👤 Posted by
                    ${escapeHTML(
                        project.creatorName || getUserName(ownerId)
                    )}
                </p>

                <p>📂 ${escapeHTML(project.category || "Other")}</p>

                <p>👥 Team size:
                    ${Number(project.teamSize) || 1}
                </p>

                <div class="tag-list">
                    ${skills.map(skill =>
                        `<span class="tag">${escapeHTML(skill)}</span>`
                    ).join("")}
                </div>

                <div class="card-actions">
                    ${!isOwner
                        ? `<button
                            class="btn btn-primary"
                            data-action="join-project"
                            data-id="${escapeHTML(project.id)}"
                            ${alreadyRequested ? "disabled" : ""}
                        >
                            ${alreadyRequested
                                ? "Request Sent"
                                : "Request to Join"}
                        </button>`
                        : `<span class="status status-pending">
                            Your Project
                        </span>`
                    }
                </div>
            </article>
        `;
    }).join("");
}


    // ==========================================
    // 8. POST PROJECT
    // ==========================================

    document.getElementById("postProjectForm")
        ?.addEventListener("submit", function (event) {

            event.preventDefault();

            const title = document.getElementById("projectTitle").value.trim();
            const description = document.getElementById("projectDescription").value.trim();
            const category = document.getElementById("projectCategory").value;
            const teamSize = Number(document.getElementById("projectTeamSize").value);
            const skills = document.getElementById("projectSkills").value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

            const deadline = document.getElementById("projectDeadline").value;

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
            addActivity(`You published the project "${title}".`, "📁");

            showToast("Project published successfully!");

            setTimeout(() => {
                window.location.href = "my-projects.html";
            }, 700);
        });

    // ==========================================
    // 9. MY PROJECTS
    // ==========================================

    function renderMyProjects() {
        const container = document.getElementById("myProjectsList");
        if (!container) return;

        const projects = getUserProjects();
        const requests = read(KEYS.requests, []);

        setText("myProjectCount", projects.length);
        setText("openProjectCount", projects.filter(p => p.status === "open").length);

        const projectIds = projects.map(p => p.id);

        const requestCount = requests.filter(request =>
            projectIds.includes(request.projectId) &&
            request.status === "pending"
        ).length;

        setText("projectRequestCount", requestCount);

        if (!projects.length) {
            container.innerHTML = `<p class="empty-state">You haven't posted any projects yet.</p>`;
            return;
        }

        container.innerHTML = projects.map(project => `
            <article class="project-card">
                <span class="status ${project.status === "open" ? "status-open" : "status-closed"}">${escapeHTML(project.status)}</span>
                <h3>${escapeHTML(project.title)}</h3>
                <p>${escapeHTML(project.description)}</p>
                <p>Category: ${escapeHTML(project.category)}</p>
                <p>Required skills: ${project.skills.map(escapeHTML).join(", ")}</p>
                <p>Deadline: ${escapeHTML(project.deadline || "Not specified")}</p>
                <div class="card-actions">
                    <button class="btn btn-secondary" data-action="toggle-project" data-id="${escapeHTML(project.id)}">${project.status === "open" ? "Close Project" : "Reopen Project"}</button>
                    <button class="btn btn-danger" data-action="delete-project" data-id="${escapeHTML(project.id)}">Delete</button>
                </div>
            </article>
        `).join("");
    }

    // ==========================================
    // 10. COLLABORATION REQUESTS
    // ==========================================

    function renderCollaborations() {
        const incoming = document.getElementById("incomingRequests");
        const sent = document.getElementById("sentRequests");
        const active = document.getElementById("activeCollaborations");

        if (!incoming || !sent || !active) return;

        const requests = read(KEYS.requests, []);
        const projects = read(KEYS.projects, []);

        const incomingRequests = requests.filter(request =>
            request.receiverId === userId && request.status === "pending"
        );

        const sentRequests = requests.filter(request =>
            request.senderId === userId
        );

        const activeRequests = requests.filter(request =>
            (request.senderId === userId || request.receiverId === userId) &&
            request.status === "accepted"
        );

        incoming.innerHTML = incomingRequests.length
            ? incomingRequests.map(request => {
                const project = projects.find(p => p.id === request.projectId);

                return `
                    <div class="request-item">
                        <div>
                            <p><strong>${escapeHTML(getUserName(request.senderId))}</strong> wants to join <strong>${escapeHTML(project?.title || "your project")}</strong>.</p>
                            <small>${formatDate(request.date)}</small>
                        </div>
                        <div class="request-actions">
                            <button class="btn btn-primary" data-action="accept-request" data-id="${escapeHTML(request.id)}">Accept</button>
                            <button class="btn btn-danger" data-action="reject-request" data-id="${escapeHTML(request.id)}">Reject</button>
                        </div>
                    </div>
                `;
            }).join("")
            : `<p class="empty-state">No incoming requests.</p>`;

        sent.innerHTML = sentRequests.length
            ? sentRequests.map(request => {
                const project = projects.find(p => p.id === request.projectId);

                return `
                    <div class="request-item">
                        <div>
                            <p>Request to join <strong>${escapeHTML(project?.title || "a project")}</strong></p>
                            <small>Status: ${escapeHTML(request.status)}</small>
                        </div>
                        <span class="status status-pending">${escapeHTML(request.status)}</span>
                    </div>
                `;
            }).join("")
            : `<p class="empty-state">You haven't sent any requests.</p>`;

        active.innerHTML = activeRequests.length
            ? activeRequests.map(request => `
                <div class="request-item">
                    <div>
                        <p>Collaboration with <strong>${escapeHTML(getUserName(request.senderId === userId ? request.receiverId : request.senderId))}</strong></p>
                        <small>Accepted collaboration</small>
                    </div>
                    <a href="messages.html" class="btn btn-secondary">Message</a>
                </div>
            `).join("")
            : `<p class="empty-state">No active collaborations yet.</p>`;
    }

    // ==========================================
    // 11. MESSAGING SYSTEM
    // ==========================================

    let selectedConversation = null;

    function getConversations() {
        const messages = getUserMessages();
        const ids = new Set();

        messages.forEach(message => {
            ids.add(message.senderId === userId
                ? message.receiverId
                : message.senderId);
        });

        return [...ids];
    }

    function renderMessages() {
        const list = document.getElementById("conversationList");
        if (!list) return;

        const conversations = getConversations();

        const search = (
            document.getElementById("conversationSearch")?.value || ""
        ).toLowerCase();

        const filtered = conversations.filter(id =>
            getUserName(id).toLowerCase().includes(search)
        );

        list.innerHTML = filtered.length
            ? filtered.map(id => `
                <div class="conversation-item ${selectedConversation === id ? "active" : ""}" data-action="open-conversation" data-id="${escapeHTML(id)}">
                    <div class="user-avatar">${escapeHTML(initials(getUserName(id)))}</div>
                    <div>
                        <h4>${escapeHTML(getUserName(id))}</h4>
                        <p>Open conversation</p>
                    </div>
                </div>
            `).join("")
            : `<p class="empty-state">No conversations yet. Connect with a creator to start chatting.</p>`;

        renderChat();
    }

    function renderChat() {
        const header = document.getElementById("chatHeader");
        const messagesContainer = document.getElementById("chatMessages");
        const input = document.getElementById("messageInput");
        const sendButton = document.getElementById("sendMessageButton");

        if (!header || !messagesContainer) return;

        if (!selectedConversation) {
            header.innerHTML = "<h2>Select a conversation</h2>";
            messagesContainer.innerHTML = `<p class="empty-state">Choose a conversation to view messages.</p>`;
            if (input) input.disabled = true;
            if (sendButton) sendButton.disabled = true;
            return;
        }

        header.innerHTML = `<h2>${escapeHTML(getUserName(selectedConversation))}</h2>`;

        if (input) input.disabled = false;
        if (sendButton) sendButton.disabled = false;

        const messages = read(KEYS.messages, []).filter(message =>
            (message.senderId === userId && message.receiverId === selectedConversation) ||
            (message.senderId === selectedConversation && message.receiverId === userId)
        );

        messagesContainer.innerHTML = messages.length
            ? messages.map(message => `
                <div class="message-bubble ${message.senderId === userId ? "sent" : ""}">
                    ${escapeHTML(message.text)}
                    <small>${formatDate(message.date)}</small>
                </div>
            `).join("")
            : `<p class="empty-state">Start the conversation!</p>`;

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    document.getElementById("conversationSearch")
        ?.addEventListener("input", renderMessages);

    document.getElementById("messageForm")
        ?.addEventListener("submit", function (event) {
            event.preventDefault();

            const input = document.getElementById("messageInput");
            const text = input.value.trim();

            if (!selectedConversation || !text) return;

            const messages = read(KEYS.messages, []);

            messages.push({
                id: makeId("message"),
                senderId: userId,
                receiverId: selectedConversation,
                text,
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
    // 12. NOTIFICATIONS
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
                <div class="notification-item ${item.read ? "" : "unread"}">
                    <div>
                        <p>${escapeHTML(item.message)}</p>
                        <small>${formatDate(item.date)}</small>
                    </div>
                    ${!item.read
                        ? `<button class="btn btn-secondary" data-action="read-notification" data-id="${escapeHTML(item.id)}">Mark Read</button>`
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
    // 13. PROFILE DISPLAY
    // ==========================================

    function renderProfile() {
        const profile = getProfile(userId);
        if (!profile) return;

        setText("profileName", profile.name);
        setText("profileHeadline", profile.headline || "Creator on CollabSpace");
        setText("profileLocation", profile.location || "Location not added");
        setText("profileAbout", profile.about || "Add an introduction to tell other creators about yourself.");
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
                    if (url.protocol === "https:" || url.protocol === "http:") {
                        portfolio.href = url.href;
                        portfolio.textContent = "Visit Portfolio";
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
            ? ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length
            : 0;

        setText(
            "profileRating",
            ratings.length
                ? `${average.toFixed(1)} / 5 (${ratings.length} ratings)`
                : "No ratings yet"
        );
    }

    // ==========================================
    // 14. EDIT PROFILE
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

    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value || "";
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

            if (profile.portfolio) {
                try {
                    const url = new URL(profile.portfolio);
                    if (!["http:", "https:"].includes(url.protocol)) {
                        showToast("Please use a valid HTTP or HTTPS portfolio URL.");
                        return;
                    }
                } catch {
                    showToast("Please enter a valid portfolio URL.");
                    return;
                }
            }

            saveProfile(profile);

            const updatedUser = {
                id: userId,
                name: profile.name,
                email: user.email
            };

            write(KEYS.currentUser, updatedUser);

            const users = read(KEYS.users, []).map(account =>
                account.id === userId
                    ? { ...account, name: profile.name }
                    : account
            );

            write(KEYS.users, users);

            addActivity("You updated your creator profile.", "◉");

            showToast("Profile updated successfully!");

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 700);
        });

    // ==========================================
    // 15. SETTINGS
    // ==========================================

    function loadSettings() {
        const settings = read(KEYS.settings, {});

        setChecked("darkThemeToggle", settings.darkTheme !== false);
        setChecked("emailNotificationsToggle", settings.emailNotifications !== false);
        setChecked("messageNotificationsToggle", settings.messageNotifications !== false);
    }

    function setChecked(id, value) {
        const element = document.getElementById(id);
        if (element) element.checked = value;
    }

    document.getElementById("saveSettings")
        ?.addEventListener("click", function () {

            const settings = {
                darkTheme: document.getElementById("darkThemeToggle").checked,
                emailNotifications: document.getElementById("emailNotificationsToggle").checked,
                messageNotifications: document.getElementById("messageNotificationsToggle").checked
            };

            write(KEYS.settings, settings);
            showToast("Preferences saved.");
        });

    // ==========================================
    // 16. MODERATION AND REPORTING
    // ==========================================

    function renderModeration() {
        const container = document.getElementById("moderationReports");
        if (!container) return;

        const reports = read(KEYS.reports, []);

        setText("totalReports", reports.length);
        setText("pendingReports", reports.filter(r => r.status === "pending").length);
        setText("resolvedReports", reports.filter(r => r.status === "resolved").length);

        container.innerHTML = reports.length
            ? reports.map(report => `
                <div class="report-item">
                    <div>
                        <p><strong>${escapeHTML(report.reason)}</strong></p>
                        <p>${escapeHTML(report.description)}</p>
                        <small>Reported by ${escapeHTML(getUserName(report.reporterId))} · ${formatDate(report.date)}</small>
                    </div>
                    <div class="request-actions">
                        <span class="status ${report.status === "resolved" ? "status-open" : "status-pending"}">${escapeHTML(report.status)}</span>
                        ${report.status === "pending"
                            ? `<button class="btn btn-primary" data-action="resolve-report" data-id="${escapeHTML(report.id)}">Resolve</button>`
                            : ""
                        }
                    </div>
                </div>
            `).join("")
            : `<p class="empty-state">No reports to review.</p>`;
    }

    function submitReport(targetId, reason, description) {
        if (!targetId || !reason || !description.trim()) {
            showToast("Please complete the report details.");
            return;
        }

        const reports = read(KEYS.reports, []);

        reports.unshift({
            id: makeId("report"),
            reporterId: userId,
            targetId,
            reason,
            description: description.trim(),
            status: "pending",
            date: new Date().toISOString()
        });

        write(KEYS.reports, reports);
        addActivity("You submitted a community report.", "⚑");
        showToast("Report submitted for review.");
    }

    // ==========================================
    // 17. RATINGS AND REPUTATION
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
    // 18. CREATOR CONNECTIONS
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

        addActivity(`You sent a connection request to ${getUserName(targetId)}.`, "🤝");

        showToast("Connection request sent!");
    }

    // ==========================================
    // 19. JOIN PROJECT REQUEST
    // ==========================================

    function joinProject(projectId) {
        const projects = read(KEYS.projects, []);
        const project = projects.find(item => item.id === projectId);

        if (!project || project.ownerId === userId) return;

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
            receiverId: project.ownerId,
            projectId,
            type: "project",
            status: "pending",
            date: new Date().toISOString()
        });

        write(KEYS.requests, requests);

        addNotification(
            project.ownerId,
            `${user.name} requested to join your project "${project.title}".`,
            "project-request"
        );

        addActivity(`You requested to join "${project.title}".`, "🤝");

        showToast("Join request sent!");
        renderProjects();
    }

    // ==========================================
    // 20. ACCEPT / REJECT REQUESTS
    // ==========================================

    function updateRequest(requestId, status) {
        const requests = read(KEYS.requests, []);
        const request = requests.find(item => item.id === requestId);

        if (!request || request.receiverId !== userId ||
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
    }

    // ==========================================
    // 21. PROJECT MANAGEMENT
    // ==========================================

    function toggleProject(projectId) {
        const projects = read(KEYS.projects, []);
        const project = projects.find(item =>
            item.id === projectId && item.ownerId === userId
        );

        if (!project) return;

        project.status = project.status === "open" ? "closed" : "open";

        write(KEYS.projects, projects);
        renderMyProjects();
        showToast("Project status updated.");
    }

    function deleteProject(projectId) {
        if (!confirm("Are you sure you want to delete this project?")) return;

        const projects = read(KEYS.projects, []);
        const project = projects.find(item =>
            item.id === projectId && item.ownerId === userId
        );

        if (!project) return;

        write(
            KEYS.projects,
            projects.filter(item => item.id !== projectId)
        );

        write(
            KEYS.requests,
            read(KEYS.requests, []).filter(item => item.projectId !== projectId)
        );

        addActivity(`You deleted the project "${project.title}".`, "🗑");
        renderMyProjects();
        showToast("Project deleted.");
    }

    // ==========================================
    // 22. GLOBAL BUTTON ACTION HANDLER
    // ==========================================

    document.addEventListener("click", function (event) {

        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        switch (action) {

            case "connect":
                sendConnectionRequest(id);
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
    // 23. CREATOR PROFILE VIEW
    // ==========================================

    function viewCreatorProfile(id) {
        const profile = getProfile(id);
        if (!profile) return;

        const skills = (profile.skills || []).join(", ");

        alert(
            `CREATOR PROFILE\n\n` +
            `Name: ${profile.name}\n` +
            `Headline: ${profile.headline}\n` +
            `Location: ${profile.location || "Not added"}\n\n` +
            `About: ${profile.about || "No introduction"}\n\n` +
            `Skills: ${skills || "Not added"}\n\n` +
            `Availability: ${profile.availability}`
        );
    }

    // ==========================================
    // 24. REPORT AND RATING FORM HELPERS
    // ==========================================

    window.collabSpaceReport = submitReport;
    window.collabSpaceRate = submitRating;
    window.collabSpaceMatches = getBestMatches;

    // ==========================================
    // 25. PAGE INITIALISATION
    // ==========================================

    switch (page) {

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

    // ==========================================
    // 26. CROSS-PAGE DATA REFRESH
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

    console.log("CollabSpace 2.0 application loaded:", page);

});
