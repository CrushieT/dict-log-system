let logs = [];         // global array to keep current visitors
let filteredLogs = []; // filtered logs for search/sort

// Fetch visitors
async function loadVisitors() {
    try {
        const response = await fetch("/api/superuser/visitor");
        logs = await response.json(); 
        filteredLogs = [...logs]; // initialize filteredLogs
        applySort(); // apply initial sort if needed
        renderLogs(filteredLogs);
    } catch (err) {
        console.error("Failed to load visitor logs:", err);
    }
}

// Fetch Metabase dashboard URL
async function loadDashboard() {
    try {
        const response = await fetch('/api/superuser/metabase-url'); // endpoint returns {url: "..."}
        const data = await response.json();
        document.getElementById('metabaseFrame').src = data.url;
    } catch (err) {
        console.error("Failed to load Metabase dashboard:", err);
    }
}

// Render logs table
function renderLogs(data) {
    const tbody = document.getElementById('logsBody');
    tbody.innerHTML = '';

    data.forEach((visitor, index) => { // index starts from 0
        const dateObj = new Date(visitor.timestamp);
        const formattedDate = dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td> <!-- Display number -->
            <td><img src="https://localhost:8443/images/${visitor.photo}" alt="" class="table-img"></td>
            <td>${visitor.first_name || ""}</td>
            <td>${visitor.middle_initial || ""}</td>
            <td>${visitor.last_name || ""}</td>
            <td>${visitor.purpose || ""}</td>
            <td>${formattedDate}</td>
            <td><button class="action-btn" data-id="${visitor.id}">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}


// Safe lowercase helper
const safeToLower = str => (str || "").toString().toLowerCase();

// --- LIVE SEARCH ---
document.getElementById('searchInput').addEventListener('input', e => {
    const search = e.target.value.toLowerCase();
    filteredLogs = logs.filter(l =>
        safeToLower(l.first_name).includes(search) ||
        safeToLower(l.last_name).includes(search) ||
        safeToLower(l.purpose).includes(search)
    );
    applySort();
    renderLogs(filteredLogs);
});

// --- SORTING ---
document.getElementById('sortSelect').addEventListener('change', () => {
    applySort();
    renderLogs(filteredLogs);
});

function applySort() {
    const sortBy = document.getElementById('sortSelect').value;

    switch (sortBy) {
        case "time_asc":
            filteredLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case "time_desc":
            filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case "fname_asc":
            filteredLogs.sort((a, b) => safeToLower(a.first_name).localeCompare(safeToLower(b.first_name)));
            break;
        case "fname_desc":
            filteredLogs.sort((a, b) => safeToLower(b.first_name).localeCompare(safeToLower(a.first_name)));
            break;
        case "lname_asc":
            filteredLogs.sort((a, b) => safeToLower(a.last_name).localeCompare(safeToLower(b.last_name)));
            break;
        case "lname_desc":
            filteredLogs.sort((a, b) => safeToLower(b.last_name).localeCompare(safeToLower(a.last_name)));
            break;
        default:
            break;
    }
}

// --- DELETE FUNCTIONALITY ---
document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("action-btn")) {
        const id = e.target.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this visitor log?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/superuser/visitor/${id}`, { method: 'DELETE' });

            if (response.ok) {
                const index = logs.findIndex(l => l.id == id);
                if (index !== -1) logs.splice(index, 1);

                filteredLogs = filteredLogs.filter(l => l.id != id);
                renderLogs(filteredLogs);

                alert("Visitor deleted successfully");
            } else {
                const errMsg = await response.text();
                alert("Error deleting visitor: " + errMsg);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting visitor. Check console for details.");
        }
    }
});

// --- DATE FILTER ---
document.getElementById('filterDateBtn').addEventListener('click', () => {
    const fromDateInput = document.getElementById('fromDate').value;
    const toDateInput = document.getElementById('toDate').value;

    if (!fromDateInput || !toDateInput) {
        alert('Please select both From and To dates');
        return;
    }

    const fromDate = new Date(fromDateInput);
    const toDate = new Date(toDateInput);

    filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp); // convert string to Date
        return logDate >= fromDate && logDate <= toDate;
    });

    // Apply current search filter
    const search = document.getElementById('searchInput').value.toLowerCase();
    if (search) {
        filteredLogs = filteredLogs.filter(l =>
            safeToLower(l.first_name).includes(search) ||
            safeToLower(l.last_name).includes(search) ||
            safeToLower(l.purpose).includes(search)
        );
    }

    // Apply current sort
    applySort();
    renderLogs(filteredLogs);
});

// Initialize
window.onload = () => {
    loadDashboard();
    loadVisitors();
};

renderLogs(logs);



document.getElementById("logoutBtn").addEventListener("click", async () => {
  const response = await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });

  if (response.ok) {
    // Clear any local data and redirect to login page
    window.location.href = "index.html";
  } else {
    alert("Logout failed!");
  }
}); 


// Excel export
document.getElementById("exportExcelBtn").addEventListener("click", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Visitor Logs");

    // Set headers
    sheet.addRow(["ID", "Image", "First Name", "M.I.", "Last Name", "Purpose", "Date"]);

    const rows = document.querySelectorAll("#logsBody tr");

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const cells = rows[rowIndex].children;

        const row = sheet.addRow([
            cells[0].textContent,
            "", // placeholder for image
            cells[2].textContent,
            cells[3].textContent,
            cells[4].textContent,
            cells[5].textContent,
            cells[6].textContent
        ]);

        // Process image
        const img = cells[1].querySelector("img");
        if (img) {
            const imageUrl = img.src;

            // Fetch image as arrayBuffer
            const arrayBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());

            // Add image to workbook
            const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: imageUrl.endsWith(".png") ? "png" : "jpeg",
            });

            // Place image into the cell (rowIndex + 2 to skip headers)
            sheet.addImage(imageId, {
                tl: { col: 1, row: rowIndex + 1 },
                br: { col: 2, row: rowIndex + 2 }
            });

            sheet.getRow(rowIndex + 2).height = 60;
        }
    }

    // Column widths
    sheet.columns = [
        { width: 8 },
        { width: 15 },
        { width: 18 },
        { width: 8 },
        { width: 18 },
        { width: 25 },
        { width: 15 }
    ];

    // Export file
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "visitor_logs_with_images.xlsx");
    });
});




 // Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');
        tabContents.forEach(tc => {
            tc.classList.remove('active');
            if(tc.id === tab) tc.classList.add('active');
        });
    });
});


// ADMIN LIST TAB

// Admin list array
let admins = [];

// Fetch admins from backend
async function loadAdmins() {
    try {
        const response = await fetch("/api/superuser/admin-list"); // Make sure this endpoint returns admin list
        admins = await response.json(); // store in global array
        renderAdminTable();
    } catch (error) {
        console.error("Failed to load admins:", error);
    }
}


// Render admins table
function renderAdminTable() {
    const tbody = document.getElementById("adminBody");
    tbody.innerHTML = ""; // Clear table

    admins.forEach(admin => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${admin.id}</td>
            <td>${admin.firstName}</td>
            <td>${admin.middleInitial}</td>
            <td>${admin.lastName}</td>
            <td>${admin.email}</td>
            <td>${admin.role}</td>
            <td><button class="delete-btn" onclick="deleteAdmin(${admin.id})">Delete</button></td>
        `;

        tbody.appendChild(tr);
    });
}

// Delete admin by ID (frontend only for now)
function deleteAdmin(adminId) {
    if (confirm("Are you sure you want to delete this admin?")) {
        // Remove from array
        admins = admins.filter(admin => admin.id !== adminId);
        renderAdminTable();

        // TODO: Call backend to delete admin in DB
        // fetch(`/api/admin/${adminId}`, { method: 'DELETE' });
    }
}

// Initial load 
loadAdmins();
