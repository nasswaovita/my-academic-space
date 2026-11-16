/* =========================================
   MY ACADEMIC SPACE — SEMESTER 5
   Folder Arsip + Notifikasi Deadline + Urutan Tugas
========================================= */

const STORAGE_KEY = "nasswa_academic_archive_v2";

const DATA_BAWAAN_DEFAULT = [
    {
        id: "default-tugas-1",
        courseId: "pemrograman-platform",
        courseName: "Pemrograman Berbasis Platform",
        type: "tugas",
        title: "Cetak Biru Inklusivitas Digital (Kelompok 2)",
        deadline: "2026-11-20",
        completed: false,
        note: "Presentasi UX & Design System",
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
        completed: false,
        note: "Quiz Assignment",
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
        title: "Studi Kasus Ossom VR (Simulasi Medis)",
        deadline: "",
        completed: false,
        note: "Referensi Tugas 2",
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
            if (parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return DATA_BAWAAN_DEFAULT;
}

function saveArchiveData(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (e) {
        alert("Ukuran file terlalu besar untuk penyimpanan browser (maks 2.5MB). Gunakan tautan Google Drive/GitHub.");
        return false;
    }
}

function formatTanggalSekarang() {
    return new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function hitungInfoDeadline(deadlineStr, isDone) {
    if (isDone) {
        return { label: "✓ Selesai", level: "done", diffMs: Infinity };
    }
    if (!deadlineStr) {
        return { label: "Tanpa tenggat", level: "normal", diffMs: Infinity - 1 };
    }

    const target = new Date(deadlineStr + "T23:59:59");
    const now = new Date();
    const diffMs = target - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const tglLabel = target.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short"
    });

    if (diffMs < 0) {
        return { label: `⚠ Terlewat (${tglLabel})`, level: "urgent", diffMs };
    }
    if (diffHours <= 48) {
        return {
            label: diffDays <= 1 ? `🔥 Deadline Hari Ini/Besok (${tglLabel})` : `⏰ H-${diffDays} (${tglLabel})`,
            level: "urgent",
            diffMs
        };
    }
    if (diffDays <= 5) {
        return { label: `⏳ H-${diffDays} (${tglLabel})`, level: "soon", diffMs };
    }
    return { label: `📅 Tenggat ${tglLabel}`, level: "normal", diffMs };
}

function urutkanTugas(items) {
    return [...items].sort((a, b) => {
        if (Boolean(a.completed) !== Boolean(b.completed)) {
            return a.completed ? 1 : -1;
        }
        const timeA = a.deadline ? new Date(a.deadline + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.deadline ? new Date(b.deadline + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
    });
}

function tambahItemAkademik({ courseId, courseName, type, title, deadline, note, linkUrl, fileInput }) {
    const items = getArchiveData();

    const simpan = (fileName, fileDataUrl) => {
        items.unshift({
            id: "item-" + Date.now(),
            courseId,
            courseName,
            type,
            title: title.trim(),
            deadline: deadline || "",
            completed: false,
            note: note ? note.trim() : "",
            linkUrl: linkUrl ? linkUrl.trim() : "",
            fileName: fileName || "",
            fileDataUrl: fileDataUrl || "",
            date: formatTanggalSekarang()
        });

        if (saveArchiveData(items)) {
            renderSemuaTampilan();
        }
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 2.5 * 1024 * 1024) {
            alert("Ukuran file maksimal 2.5 MB. Untuk file besar, unggah ke Google Drive lalu tempel link-nya.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => simpan(file.name, e.target.result);
        reader.readAsDataURL(file);
    } else {
        simpan("", "");
    }
}

function toggleSelesaiTugas(itemId) {
    const items = getArchiveData().map(item => {
        if (item.id === itemId) {
            return { ...item, completed: !item.completed };
        }
        return item;
    });
    saveArchiveData(items);
    renderSemuaTampilan();
}

function hapusItemAkademik(itemId) {
    if (!confirm("Hapus item ini dari folder arsip?")) return;
    const updated = getArchiveData().filter(item => item.id !== itemId);
    saveArchiveData(updated);
    renderSemuaTampilan();
}

/* ===== NOTIFIKASI DEADLINE DEKAT ===== */
function renderDeadlineNotification() {
    const banner = document.getElementById("deadline-notify-box");
    if (!banner) return;

    const tugasBelumSelesai = urutkanTugas(
        getArchiveData().filter(item => item.type === "tugas" && !item.completed)
    );

    const mendesak = tugasBelumSelesai.filter(item => {
        const info = hitungInfoDeadline(item.deadline, false);
        return info.level === "urgent" || info.level === "soon";
    });

    if (mendesak.length === 0) {
        banner.innerHTML = `
            <div class="deadline-banner safe">
                <span class="deadline-banner-icon">🎀</span>
                <div>
                    <h4>Semua Deadline Aman!</h4>
                    <p style="font-size:13px; color:#1b181a;">
                        ${tugasBelumSelesai.length > 0
                            ? `Ada ${tugasBelumSelesai.length} tugas belum selesai, tapi belum ada yang mendekati tenggat waktu.`
                            : "Tidak ada tanggungan tugas mendesak saat ini. Keep blooming ♡"}
                    </p>
                </div>
            </div>
        `;
        return;
    }

    const listHtml = mendesak.map(t => {
        const info = hitungInfoDeadline(t.deadline, false);
        return `<li><strong>${t.title}</strong> (${t.courseName}) — <span>${info.label}</span></li>`;
    }).join("");

    banner.innerHTML = `
        <div class="deadline-banner">
            <span class="deadline-banner-icon">🔔</span>
            <div>
                <h4>Perhatian! ${mendesak.length} Tugas Mendekati Deadline:</h4>
                <ul>${listHtml}</ul>
            </div>
        </div>
    `;
}

/* ===== RENDER FOLDER DI INDEX.HTML ===== */
function renderIndexFolders(type, containerId, emptyPlaceholderHtml) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let allItems = getArchiveData().filter(item => item.type === type);
    if (allItems.length === 0) {
        container.innerHTML = emptyPlaceholderHtml;
        return;
    }

    if (type === "tugas") {
        allItems = urutkanTugas(allItems);
    }

    const grouped = {};
    allItems.forEach(item => {
        if (!grouped[item.courseId]) {
            grouped[item.courseId] = { courseName: item.courseName, items: [] };
        }
        grouped[item.courseId].items.push(item);
    });

    let html = `<div class="folder-grid">`;
    Object.keys(grouped).forEach(courseId => {
        const folder = grouped[courseId];
        const tagLabel = type === "materi" ? "FOLDER MATERI" : "FOLDER TUGAS";

        html += `
            <div class="folder-box" data-tag="${tagLabel}">
                <div class="folder-header">
                    <a href="mata-kuliah.html?id=${courseId}" class="folder-title" style="text-decoration:none;">📁 ${folder.courseName}</a>
                    <span class="folder-count">${folder.items.length} berkas</span>
                </div>
                <div class="folder-items">
        `;

        folder.items.forEach(item => {
            const actionBtn = item.fileDataUrl
                ? `<a href="${item.fileDataUrl}" download="${item.fileName}" class="btn-mini">Unduh</a>`
                : item.linkUrl
                ? `<a href="${item.linkUrl}" target="_blank" rel="noopener" class="btn-mini">Buka</a>`
                : "";

            const deadlineInfo = type === "tugas" ? hitungInfoDeadline(item.deadline, item.completed) : null;
            const checkHtml = type === "tugas"
                ? `<input type="checkbox" class="task-checkbox" ${item.completed ? "checked" : ""} onchange="toggleSelesaiTugas('${item.id}')" title="Tandai selesai">`
                : "";

            html += `
                <div class="folder-item ${item.completed ? "is-done" : ""}">
                    <div class="task-check-wrap" style="overflow:hidden;">
                        ${checkHtml}
                        <div class="folder-item-info">
                            <span class="folder-item-title" title="${item.title}">${item.title}</span>
                            <span class="folder-item-meta">${item.fileName || item.date}</span>
                            ${deadlineInfo ? `<span class="deadline-pill ${deadlineInfo.level}">${deadlineInfo.label}</span>` : ""}
                        </div>
                    </div>
                    <div class="folder-item-actions">
                        ${actionBtn}
                        <button type="button" class="btn-mini danger" onclick="hapusItemAkademik('${item.id}')">✕</button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

/* ===== RENDER DAFTAR DI MATA-KULIAH.HTML ===== */
function renderCourseList(courseId, type, containerId, emptyText) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let items = getArchiveData().filter(item => item.courseId === courseId && item.type === type);
    if (items.length === 0) {
        container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
        return;
    }

    if (type === "tugas") {
        items = urutkanTugas(items);
    }

    let html = `<div class="submitted-list">`;
    items.forEach(item => {
        const deadlineInfo = type === "tugas" ? hitungInfoDeadline(item.deadline, item.completed) : null;
        const badgeHtml = type === "tugas"
            ? `<span class="deadline-pill ${deadlineInfo.level}">${deadlineInfo.label}</span>`
            : `<span class="badge-status">📚 Materi</span>`;

        const checkHtml = type === "tugas"
            ? `<input type="checkbox" class="task-checkbox" ${item.completed ? "checked" : ""} onchange="toggleSelesaiTugas('${item.id}')">`
            : "";

        const fileBtn = item.fileDataUrl ? `<a href="${item.fileDataUrl}" download="${item.fileName}" class="btn-mini">⬇ Unduh</a>` : "";
        const linkBtn = item.linkUrl ? `<a href="${item.linkUrl}" target="_blank" rel="noopener" class="btn-mini">🔗 Buka</a>` : "";

        html += `
            <div class="submitted-card ${item.completed ? "is-done" : ""}">
                <div class="task-check-wrap">
                    ${checkHtml}
                    <div class="submitted-main">
                        <h4>${item.title}</h4>
                        <p>Ditambahkan ${item.date}${item.note ? " · " + item.note : ""}</p>
                        ${badgeHtml}
                    </div>
                </div>
                <div class="folder-item-actions">
                    ${fileBtn}
                    ${linkBtn}
                    <button type="button" class="btn-mini danger" onclick="hapusItemAkademik('${item.id}')">Hapus</button>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderSemuaTampilan() {
    renderDeadlineNotification();

    renderIndexFolders(
        "materi",
        "index-materi-folders",
        `<div class="info-note"><span>🌷</span><p>Belum ada folder materi. Unggah materi dari form di atas untuk menyimpannya ke dalam folder mata kuliah.</p></div>`
    );

    renderIndexFolders(
        "tugas",
        "index-tugas-folders",
        `<div class="info-note"><span>💌</span><p>Belum ada tugas. Tugas yang belum selesai akan otomatis diurutkan dari deadline paling dekat di sini.</p></div>`
    );

    const coursePage = document.querySelector("[data-course-id]");
    if (coursePage) {
        const courseId = coursePage.getAttribute("data-course-id");
        renderCourseList(courseId, "materi", "materi-list", "Belum ada materi yang tersimpan di folder mata kuliah ini.");
        renderCourseList(courseId, "tugas", "tugas-list", "Belum ada tugas yang dikumpulkan untuk mata kuliah ini.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderSemuaTampilan();

    const quickForm = document.getElementById("quick-submit-form");
    if (quickForm) {
        quickForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const selectMatkul = document.getElementById("quick-matkul");
            tambahItemAkademik({
                courseId: selectMatkul.value,
                courseName: selectMatkul.options[selectMatkul.selectedIndex].text,
                type: document.getElementById("quick-kategori").value,
                title: document.getElementById("quick-judul").value,
                deadline: document.getElementById("quick-deadline").value,
                note: document.getElementById("quick-catatan").value,
                linkUrl: document.getElementById("quick-link").value,
                fileInput: document.getElementById("quick-file")
            });
            quickForm.reset();
        });
    }
});
/* =========================================
   PROJECT SYSTEM ARCHIVE
========================================= */

const PROJECT_STORAGE_KEY = "nasswa_project_system_v1";

function getProjectData() {
    try {
        const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Data awal otomatis agar tidak kosong saat pertama dibuka
    return [
        {
            id: "proj-default-1",
            title: "My Academic Space",
            status: "Completed",
            tech: "HTML5, CSS3, JavaScript",
            linkUrl: "https://github.com/nasswaovita/my-academic-space",
            desc: "Website manajemen materi kuliah, arsip folder tugas, dan pengingat deadline bertema Girly Polka."
        }
    ];
}

function saveProjectData(list) {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(list));
}

function hapusProject(id) {
    if (!confirm("Hapus project ini dari daftar?")) return;
    const updated = getProjectData().filter(p => p.id !== id);
    saveProjectData(updated);
    renderProjects();
}

function renderProjects() {
    const container = document.getElementById("index-project-list");
    if (!container) return;

    const projects = getProjectData();
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="info-note">
                <span>✨</span>
                <p>Belum ada project yang ditambahkan. Isi form di atas untuk menampilkan kartu project kamu di sini.</p>
            </div>
        `;
        return;
    }

    let html = `<div class="folder-grid">`;
    projects.forEach(p => {
        const badgeLabel = p.status === "Completed" ? "✓ Selesai"
            : p.status === "Planning" ? "📝 Perancangan"
            : "🚧 In Progress";

        const linkBtn = p.linkUrl
            ? `<a href="${p.linkUrl}" target="_blank" rel="noopener" class="btn-mini">🔗 Lihat Repo / Demo</a>`
            : "";

        html += `
            <div class="folder-box" data-tag="PROJECT SYSTEM">
                <div class="folder-header">
                    <span class="folder-title">💻 ${p.title}</span>
                    <span class="folder-count">${badgeLabel}</span>
                </div>
                <p style="font-size:13px; color:#1b181a; margin-bottom:10px; line-height:1.6;">${p.desc}</p>
                ${p.tech ? `<p style="font-size:11.5px; color:#6e6369; margin-bottom:12px;"><strong>Tech:</strong> ${p.tech}</p>` : ""}
                <div class="folder-item-actions" style="justify-content:space-between;">
                    ${linkBtn || "<span></span>"}
                    <button type="button" class="btn-mini danger" onclick="hapusProject('${p.id}')">Hapus</button>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
    renderProjects();

    const projForm = document.getElementById("project-submit-form");
    if (projForm) {
        projForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const list = getProjectData();
            list.unshift({
                id: "proj-" + Date.now(),
                title: document.getElementById("proj-judul").value.trim(),
                status: document.getElementById("proj-status").value,
                tech: document.getElementById("proj-tech").value.trim(),
                linkUrl: document.getElementById("proj-link").value.trim(),
                desc: document.getElementById("proj-deskripsi").value.trim()
            });
            saveProjectData(list);
            projForm.reset();
            renderProjects();
        });
    }
});
