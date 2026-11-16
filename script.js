/* =========================================================
   MY ACADEMIC SPACE — GIRLY POLKA EDITION (JS)
   ========================================================= */

const STORAGE_KEY = "nasswa_academic_archive_v2";
const PROJECT_STORAGE_KEY = "nasswa_academic_projects_v1";

/* ---------------------------------------------------------
   DATA BAWAAN & ARSIP PDF PERMANEN (TAMPIL DI SEMUA PERANGKAT)
   Cara tambah PDF baru:
   1. Upload file PDF ke repository GitHub (misal: Tugas-Baru.pdf)
   2. Tambahkan blok objek baru di dalam array di bawah ini
   --------------------------------------------------------- */
const DATA_BAWAAN_DEFAULT = [
    {
        id: "default-tugas-1",
        courseId: "pemrograman-platform",
        courseName: "Pemrograman Berbasis Platform",
        type: "tugas",
        title: "Cetak Biru Inklusivitas Digital (Kelompok 2)",
        deadline: "2026-11-20",
        completed: true,
        note: "Presentasi UX, Aksesibilitas & Design System · Sudah dikumpulkan",
        linkUrl: "",
        fileName: "",
        fileDataUrl: "",
        date: "16 Nov 2026"
    },
        {
        id: "default-tugas-2",
        courseId: "analisis-design-pl",
        courseName: "Analisis dan Design PL",
        type: "tugas",
        title: "Dokumen StockMate (Extreme Programming)",
        deadline: "2026-11-22",
        completed: true,
        note: "Quiz Assignment · Sudah dikumpulkan",
        linkUrl: "",
        fileName: "Jawaban_Quiz_StockMate_Nasswa_Ovita_FINAL (1).pdf",
        fileDataUrl: "Jawaban_Quiz_StockMate_Nasswa_Ovita_FINAL%20(1).pdf",
        date: "16 Nov 2026"
    
    },
    {
        id: "default-tugas-3",
        courseId: "interaksi-manusia-komputer",
        courseName: "Interaksi Manusia & Komputer",
        type: "tugas",
        title: "Analisis Error Prevention E-Commerce (Shopee)",
        deadline: "2026-11-24",
        completed: false,
        note: "Evaluasi heuristik Nielsen & Ben Shneiderman",
        linkUrl: "",
        fileName: "",
        fileDataUrl: "",
        date: "16 Nov 2026"
    },
    {
        id: "default-materi-1",
        courseId: "teknologi-ar-vr",
        courseName: "Teknologi AR/VR",
        type: "materi",
        title: "Studi Kasus Ossom VR (Simulasi Medis vs Militer)",
        deadline: "",
        completed: false,
        note: "Referensi reliabilitas & keamanan aplikasi XR",
        linkUrl: "",
        fileName: "",
        fileDataUrl: "",
        date: "16 Nov 2026"
    }
];

function getArchiveData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Gagal membaca localStorage:", e);
    }
    return [...DATA_BAWAAN_DEFAULT];
}

function saveArchiveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        alert("Ukuran file terlalu besar untuk penyimpanan browser lokal. Gunakan link Google Drive atau simpan file PDF langsung ke repository GitHub ya!");
    }
}

function getDeadlineInfo(deadlineStr, isCompleted) {
    if (isCompleted) {
        return { text: "Selesai ✓", cls: "badge-done", diffDays: 9999 };
    }
    if (!deadlineStr) {
        return { text: "Tanpa Deadline", cls: "badge-normal", diffDays: 999 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(deadlineStr + "T00:00:00");
    const diffTime = target - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const formatted = target.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    if (diffDays < 0) {
        return { text: `Terlewat (${formatted})`, cls: "badge-urgent", diffDays };
    } else if (diffDays === 0) {
        return { text: `Hari Ini! (${formatted})`, cls: "badge-urgent", diffDays };
    } else if (diffDays === 1) {
        return { text: `Besok (${formatted})`, cls: "badge-urgent", diffDays };
    } else if (diffDays <= 3) {
        return { text: `${diffDays} hari lagi (${formatted})`, cls: "badge-soon", diffDays };
    } else {
        return { text: formatted, cls: "badge-normal", diffDays };
    }
}

function sortTasksByUrgency(tasks) {
    return [...tasks].sort((a, b) => {
        const compA = a.completed ? 1 : 0;
        const compB = b.completed ? 1 : 0;
        if (compA !== compB) return compA - compB;

        const infoA = getDeadlineInfo(a.deadline, a.completed);
        const infoB = getDeadlineInfo(b.deadline, b.completed);
        return infoA.diffDays - infoB.diffDays;
    });
}

function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function tambahItemAkademik({ courseId, courseName, type, title, deadline, note, linkUrl, fileInput }) {
    const cleanTitle = (title || "").trim();
    if (!cleanTitle) return;

    const finalizeSave = (fileName, fileDataUrl) => {
        const current = getArchiveData();
        const newItem = {
            id: "item-" + Date.now(),
            courseId: courseId,
            courseName: courseName,
            type: type,
            title: cleanTitle,
            deadline: type === "tugas" ? (deadline || "") : "",
            completed: false,
            note: (note || "").trim(),
            linkUrl: (linkUrl || "").trim(),
            fileName: fileName || "",
            fileDataUrl: fileDataUrl || "",
            date: new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
            })
        };

        current.unshift(newItem);
        saveArchiveData(current);
        renderAllSections();
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 3.5 * 1024 * 1024) {
            alert("Ukuran file maksimal 3.5 MB untuk simpan cepat di browser. Untuk PDF besar, upload ke GitHub atau Google Drive lalu tempel link/nama file-nya ya!");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            finalizeSave(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        finalizeSave("", "");
    }
}

function toggleTaskComplete(id) {
    const data = getArchiveData();
    const idx = data.findIndex(item => item.id === id);
    if (idx !== -1) {
        data[idx].completed = !data[idx].completed;
        saveArchiveData(data);
        renderAllSections();
    }
}

function hapusItemAkademik(id) {
    if (!confirm("Hapus item ini dari folder arsip?")) return;
    const data = getArchiveData().filter(item => item.id !== id);
    saveArchiveData(data);
    renderAllSections();
}

function renderDeadlineBanner(containerId, filterCourseId = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let tasks = getArchiveData().filter(item => item.type === "tugas" && !item.completed);
    if (filterCourseId) {
        tasks = tasks.filter(item => item.courseId === filterCourseId);
    }

    const urgentTasks = sortTasksByUrgency(tasks).filter(t => {
        const info = getDeadlineInfo(t.deadline, false);
        return t.deadline && info.diffDays <= 3;
    });

    if (urgentTasks.length === 0) {
        container.innerHTML = "";
        return;
    }

    const listText = urgentTasks
        .map(t => {
            const info = getDeadlineInfo(t.deadline, false);
            return `<strong>${escapeHTML(t.title)}</strong> (${escapeHTML(t.courseName)} · <em>${info.text}</em>)`;
        })
        .join(" &nbsp;•&nbsp; ");

    container.innerHTML = `
        <div class="deadline-banner" role="status">
            <span class="bell-icon">🔔</span>
            <div>
                <div class="banner-title">Pengingat Deadline Terdekat (${urgentTasks.length} Tugas Belum Selesai)</div>
                <div class="banner-desc">${listText}</div>
            </div>
        </div>
    `;
}

function renderArchiveItemHTML(item, showCourseBadge = true) {
    const isTugas = item.type === "tugas";
    const deadlineInfo = isTugas ? getDeadlineInfo(item.deadline, item.completed) : null;

    let actionButtons = "";
    if (item.linkUrl) {
        actionButtons += `<a href="${escapeHTML(item.linkUrl)}" target="_blank" rel="noopener noreferrer" class="btn-mini">🔗 Buka Link</a>`;
    }
    if (item.fileDataUrl && item.fileName) {
        actionButtons += `<a href="${item.fileDataUrl}" download="${escapeHTML(item.fileName)}" target="_blank" class="btn-mini">📄 ${escapeHTML(item.fileName)}</a>`;
    }
    actionButtons += `<button type="button" class="btn-mini btn-delete" onclick="hapusItemAkademik('${item.id}')">Hapus</button>`;

    const checkboxHTML = isTugas
        ? `<input type="checkbox" class="task-checkbox" ${item.completed ? "checked" : ""} onchange="toggleTaskComplete('${item.id}')" title="Tandai selesai / belum selesai">`
        : `<span style="font-size:18px; line-height:1;">📄</span>`;

    return `
        <div class="archive-item ${item.completed ? "is-done" : ""}">
            <div class="archive-left">
                ${checkboxHTML}
                <div>
                    <div class="archive-title">${escapeHTML(item.title)}</div>
                    <div class="archive-meta">
                        ${showCourseBadge ? `<span class="badge-pill badge-course">${escapeHTML(item.courseName)}</span>` : ""}
                        ${isTugas ? `<span class="badge-pill ${deadlineInfo.cls}">⏰ ${deadlineInfo.text}</span>` : `<span class="badge-pill badge-normal">📅 Diunggah ${escapeHTML(item.date)}</span>`}
                        ${item.note ? `<span>· ${escapeHTML(item.note)}</span>` : ""}
                    </div>
                </div>
            </div>
            <div class="archive-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

function renderHomeFolders() {
    const materiHome = document.getElementById("home-materi-folders");
    const tugasHome = document.getElementById("home-tugas-folders");
    if (!materiHome && !tugasHome) return;

    const allData = getArchiveData();

    if (materiHome) {
        const materiItems = allData.filter(i => i.type === "materi");
        if (materiItems.length === 0) {
            materiHome.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🌷</span>
                    <p>Belum ada folder materi yang diunggah. Tambahkan materi dari form di atas untuk menyimpannya ke dalam folder mata kuliah.</p>
                </div>
            `;
        } else {
            const grouped = {};
            materiItems.forEach(item => {
                if (!grouped[item.courseId]) {
                    grouped[item.courseId] = { name: item.courseName, items: [] };
                }
                grouped[item.courseId].items.push(item);
            });

            materiHome.innerHTML = Object.entries(grouped)
                .map(([cId, group]) => `
                    <div class="folder-group">
                        <div class="folder-header">
                            <span class="folder-name">📁 ${escapeHTML(group.name)}</span>
                            <a href="mata-kuliah.html?id=${encodeURIComponent(cId)}" class="btn-mini">Buka Ruang Kelas (${group.items.length}) →</a>
                        </div>
                        <div class="archive-list">
                            ${group.items.map(item => renderArchiveItemHTML(item, false)).join("")}
                        </div>
                    </div>
                `)
                .join("");
        }
    }

    if (tugasHome) {
        const tugasItems = sortTasksByUrgency(allData.filter(i => i.type === "tugas"));
        if (tugasItems.length === 0) {
            tugasHome.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">✨</span>
                    <p>Belum ada tugas. Tugas yang kamu tambahkan akan otomatis diurutkan berdasarkan deadline terdekat di sini.</p>
                </div>
            `;
        } else {
            tugasHome.innerHTML = `
                <div class="archive-list">
                    ${tugasItems.map(item => renderArchiveItemHTML(item, true)).join("")}
                </div>
            `;
        }
    }
}

function renderCoursePageFolders() {
    const courseId = document.body.getAttribute("data-course-id");
    if (!courseId) return;

    renderDeadlineBanner("deadline-notify-box", courseId);

    const allData = getArchiveData().filter(item => item.courseId === courseId);
    const materiListEl = document.getElementById("materi-list");
    const tugasListEl = document.getElementById("tugas-list");

    if (materiListEl) {
        const materiItems = allData.filter(i => i.type === "materi");
        if (materiItems.length === 0) {
            materiListEl.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📚</span>
                    <p>Belum ada materi di folder mata kuliah ini. Kamu bisa menambahkannya melalui halaman Beranda.</p>
                </div>
            `;
        } else {
            materiListEl.innerHTML = `
                <div class="archive-list">
                    ${materiItems.map(item => renderArchiveItemHTML(item, false)).join("")}
                </div>
            `;
        }
    }

    if (tugasListEl) {
        const tugasItems = sortTasksByUrgency(allData.filter(i => i.type === "tugas"));
        if (tugasItems.length === 0) {
            tugasListEl.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>Belum ada tugas di mata kuliah ini. Kumpulkan tugas melalui form di atas agar tersimpan rapi di sini.</p>
                </div>
            `;
        } else {
            tugasListEl.innerHTML = `
                <div class="archive-list">
                    ${tugasItems.map(item => renderArchiveItemHTML(item, false)).join("")}
                </div>
            `;
        }
    }
}

/* =========================================================
   PROJECT SYSTEM (INTERAKTIF & TERHUBUNG KE LOCALSTORAGE)
   ========================================================= */
const DEFAULT_PROJECTS = [
    {
        id: "proj-academic-space",
        title: "My Academic Space",
        category: "Web Development",
        status: "Active",
        desc: "Website pengelolaan arsip perkuliahan, materi, jadwal, dan pengingat deadline Semester 5 dengan tema editorial Girly Polka.",
        tags: ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
        demoUrl: "index.html",
        repoUrl: "https://github.com/nasswaovita/my-academic-space"
    },
    {
        id: "proj-stockmate",
        title: "StockMate POS & Inventory",
        category: "Software Engineering",
        status: "In Progress",
        desc: "Sistem manajemen inventaris dan Point of Sale (POS) berbasis web menggunakan metode Extreme Programming.",
        tags: ["Web App", "Inventory", "POS", "XP"],
        demoUrl: "",
        repoUrl: ""
    },
    {
        id: "proj-klik-cart",
        title: "Klik Cart E-Commerce",
        category: "UI/UX & Web",
        status: "In Progress",
        desc: "Aplikasi katalog belanja online dengan validasi varian produk dan pencegahan error checkout berbasis prinsip heuristik UX.",
        tags: ["E-Commerce", "UI/UX", "Frontend"],
        demoUrl: "",
        repoUrl: ""
    }
];

function getProjectsData() {
    try {
        const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {}
    return [...DEFAULT_PROJECTS];
}

function saveProjectsData(list) {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(list));
}

function renderProjects(filterCat = "Semua") {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const allProjects = getProjectsData();
    const filtered = filterCat === "Semua"
        ? allProjects
        : allProjects.filter(p => p.category === filterCat);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <span class="empty-icon">💻</span>
                <p>Belum ada project pada kategori <strong>${escapeHTML(filterCat)}</strong>. Klik tombol "+ Tambah Project" untuk membuatnya.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered
        .map(proj => {
            const statusClass =
                proj.status === "Completed" ? "status-completed" :
                proj.status === "Active" ? "status-active" : "status-progress";

            const tagsHTML = (proj.tags || [])
                .map(t => `<span class="project-tag">#${escapeHTML(t)}</span>`)
                .join("");

            return `
                <article class="project-card">
                    <div class="project-card-top">
                        <span class="project-cat-badge">${escapeHTML(proj.category)}</span>
                        <span class="project-status ${statusClass}">${escapeHTML(proj.status)}</span>
                    </div>
                    <h3>${escapeHTML(proj.title)}</h3>
                    <p>${escapeHTML(proj.desc)}</p>
                    <div class="project-tags">${tagsHTML}</div>
                    <div class="project-card-footer">
                        <div class="project-links">
                            ${proj.demoUrl ? `<a href="${escapeHTML(proj.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-mini">✨ Preview</a>` : ""}
                            ${proj.repoUrl ? `<a href="${escapeHTML(proj.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-mini">💻 Repo</a>` : ""}
                        </div>
                        <button type="button" class="btn-mini btn-delete" onclick="hapusProject('${proj.id}')">Hapus</button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function hapusProject(id) {
    if (!confirm("Hapus project ini dari daftar showcase?")) return;
    const updated = getProjectsData().filter(p => p.id !== id);
    saveProjectsData(updated);
    const activeTab = document.querySelector(".filter-pill.active");
    renderProjects(activeTab ? activeTab.getAttribute("data-filter") : "Semua");
}

function initProjectSystem() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    renderProjects("Semua");

    const filterButtons = document.querySelectorAll(".filter-pill");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProjects(btn.getAttribute("data-filter"));
        });
    });

    const toggleBtn = document.getElementById("toggle-project-form");
    const formBox = document.getElementById("project-form-box");
    const projectForm = document.getElementById("new-project-form");

    if (toggleBtn && formBox) {
        toggleBtn.addEventListener("click", () => {
            formBox.classList.toggle("is-hidden");
        });
    }

    if (projectForm) {
        projectForm.addEventListener("submit", e => {
            e.preventDefault();
            const title = document.getElementById("proj-title").value.trim();
            const category = document.getElementById("proj-category").value;
            const status = document.getElementById("proj-status").value;
            const desc = document.getElementById("proj-desc").value.trim();
            const tagsRaw = document.getElementById("proj-tags").value;
            const demoUrl = document.getElementById("proj-demo").value.trim();
            const repoUrl = document.getElementById("proj-repo").value.trim();

            if (!title) return;

            const tags = tagsRaw
                .split(",")
                .map(t => t.trim())
                .filter(Boolean);

            const current = getProjectsData();
            current.unshift({
                id: "proj-" + Date.now(),
                title,
                category,
                status,
                desc: desc || "Project akademik dan eksplorasi teknologi.",
                tags: tags.length > 0 ? tags : [category],
                demoUrl,
                repoUrl
            });

            saveProjectsData(current);
            projectForm.reset();
            if (formBox) formBox.classList.add("is-hidden");
            renderProjects("Semua");
        });
    }
}

function renderAllSections() {
    renderDeadlineBanner("home-deadline-banner", null);
    renderHomeFolders();
    renderCoursePageFolders();
}

document.addEventListener("DOMContentLoaded", () => {
    renderAllSections();
    initProjectSystem();

    const quickForm = document.getElementById("quick-upload-form");
    if (quickForm) {
        const typeSelect = document.getElementById("up-type");
        const deadlineWrapper = document.getElementById("deadline-field-wrapper");

        if (typeSelect && deadlineWrapper) {
            typeSelect.addEventListener("change", () => {
                deadlineWrapper.style.display = typeSelect.value === "tugas" ? "flex" : "none";
            });
        }

        quickForm.addEventListener("submit", e => {
            e.preventDefault();
            const courseSelect = document.getElementById("up-course");
            const courseId = courseSelect.value;
            const courseName = courseSelect.options[courseSelect.selectedIndex].text;
            const type = document.getElementById("up-type").value;
            const title = document.getElementById("up-title").value;
            const deadline = document.getElementById("up-deadline").value;
            const note = document.getElementById("up-note").value;
            const linkUrl = document.getElementById("up-link").value;
            const fileInput = document.getElementById("up-file");

            tambahItemAkademik({
                courseId,
                courseName,
                type,
                title,
                deadline,
                note,
                linkUrl,
                fileInput
            });

            quickForm.reset();
            if (deadlineWrapper) deadlineWrapper.style.display = "flex";
        });
    }
});
