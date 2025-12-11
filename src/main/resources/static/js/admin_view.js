
// const logs = [
//     { id: 420, img: 'https://randomuser.me/api/portraits/women/12.jpg', fname: 'Lhyndee', mi: 'T', lname: 'Bamba', purpose: 'EGov service assistance', date: '2025-10-15 09:45:10' },
//     { id: 419, img: 'https://randomuser.me/api/portraits/men/33.jpg', fname: 'John', mi: 'M', lname: 'Reyes', purpose: 'Network troubleshooting', date: '2025-10-15 08:30:40' },
//     { id: 418, img: 'https://randomuser.me/api/portraits/women/77.jpg', fname: 'Grace', mi: 'C', lname: 'Lopez', purpose: 'EGov system update', date: '2025-10-14 14:20:18' },
//     { id: 417, img: 'https://randomuser.me/api/portraits/men/19.jpg', fname: 'Paulo', mi: 'S', lname: 'Villanueva', purpose: 'Hardware maintenance', date: '2025-10-14 13:45:09' },
//     { id: 416, img: 'https://randomuser.me/api/portraits/women/91.jpg', fname: 'Marianne', mi: 'G', lname: 'Cruz', purpose: 'Digital literacy consultation', date: '2025-10-14 11:03:52' },
//     { id: 415, img: 'https://randomuser.me/api/portraits/men/28.jpg', fname: 'Ramon', mi: 'J', lname: 'Santos', purpose: 'Technical support', date: '2025-10-13 16:15:40' },
//     { id: 414, img: 'https://randomuser.me/api/portraits/women/25.jpg', fname: 'Elaine', mi: 'K', lname: 'Ramos', purpose: 'Training coordination', date: '2025-10-13 15:45:22' },
//     { id: 413, img: 'https://randomuser.me/api/portraits/men/41.jpg', fname: 'Joshua', mi: 'L', lname: 'Delos Santos', purpose: 'EGov system support', date: '2025-10-13 10:12:38' },
//     { id: 412, img: 'https://randomuser.me/api/portraits/women/14.jpg', fname: 'Rhea', mi: 'M', lname: 'Perez', purpose: 'Software installation', date: '2025-10-12 09:22:12' },
//     { id: 411, img: 'https://randomuser.me/api/portraits/men/62.jpg', fname: 'Alexis', mi: 'T', lname: 'De Vera', purpose: 'EGov system inquiry', date: '2025-10-12 08:59:54' },
//     { id: 410, img: 'https://randomuser.me/api/portraits/women/85.jpg', fname: 'Bianca', mi: 'E', lname: 'Garcia', purpose: 'System backup', date: '2025-10-11 14:45:07' },
//     { id: 409, img: 'https://randomuser.me/api/portraits/men/47.jpg', fname: 'Chris', mi: 'N', lname: 'Aquino', purpose: 'Account recovery', date: '2025-10-11 13:12:26' },
//     { id: 408, img: 'https://randomuser.me/api/portraits/women/50.jpg', fname: 'Mae', mi: 'R', lname: 'Tobias', purpose: 'EGov data validation', date: '2025-10-10 15:55:34' },
//     { id: 407, img: 'https://randomuser.me/api/portraits/men/13.jpg', fname: 'Leo', mi: 'P', lname: 'Ramos', purpose: 'Technical report submission', date: '2025-10-10 14:03:19' },
//     { id: 406, img: 'https://randomuser.me/api/portraits/women/39.jpg', fname: 'Catherine', mi: 'D', lname: 'Morales', purpose: 'Training assistance', date: '2025-10-10 10:45:18' },
//     { id: 405, img: 'https://randomuser.me/api/portraits/men/8.jpg', fname: 'Karl', mi: 'A', lname: 'Fernandez', purpose: 'Database repair', date: '2025-10-09 16:33:44' },
//     { id: 404, img: 'https://randomuser.me/api/portraits/women/22.jpg', fname: 'Jessa', mi: 'B', lname: 'Villarin', purpose: 'Hardware configuration', date: '2025-10-09 14:18:56' },
//     { id: 403, img: 'https://randomuser.me/api/portraits/men/52.jpg', fname: 'Darren', mi: 'O', lname: 'Castro', purpose: 'Printer troubleshooting', date: '2025-10-09 09:54:30' },
//     { id: 402, img: 'https://randomuser.me/api/portraits/women/71.jpg', fname: 'Liza', mi: 'C', lname: 'Domingo', purpose: 'EGov user support', date: '2025-10-08 11:40:28' },
//     { id: 401, img: 'https://randomuser.me/api/portraits/women/68.jpg', fname: 'Lhyndee', mi: 'T', lname: 'Bamba', purpose: 'EGov service assistance', date: '2025-10-08 10:25:20' }
// ];

let logs = []; // global array to keep current visitors

async function loadVisitors() {
    const response = await fetch("/api/admin/visitor");
    logs = await response.json(); // store in global array
    renderLogs(logs);
}

window.onload = loadVisitors;

function renderLogs(data) {
    const tbody = document.getElementById('logsBody');
    tbody.innerHTML = '';

    data.forEach(visitor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${visitor.id}</td>
            <td><img src="https://localhost:8443/images/${visitor.photo}" alt="" class="table-img"></td>
            <td>${visitor.first_name}</td>
            <td>${visitor.middle_initial}</td>
            <td>${visitor.last_name}</td>
            <td>${visitor.purpose}</td>
            <td>${visitor.timestamp.replace('T', ' ')}</td>
            <td><button class="action-btn" data-id="${visitor.id}">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("action-btn")) {
        const id = e.target.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this visitor log?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/admin/visitor/${id}`, { method: 'DELETE' });

            if (response.ok) {
                // Remove from global logs array
                const index = logs.findIndex(l => l.id == id);
                if (index !== -1) logs.splice(index, 1);

                // Re-render table using updated logs
                renderLogs(logs);

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




document.getElementById('searchInput').addEventListener('input', e => {
    const search = e.target.value.toLowerCase();
    const filtered = logs.filter(l =>
    l.fname.toLowerCase().includes(search) ||
    l.lname.toLowerCase().includes(search) ||
    l.purpose.toLowerCase().includes(search)
    );
    renderLogs(filtered);
});

document.getElementById('sortSelect').addEventListener('change', e => {
    const sortBy = e.target.value;
    let sorted = [...logs];
    if (sortBy === 'fname') sorted.sort((a, b) => a.fname.localeCompare(b.fname));
    else if (sortBy === 'date') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    else sorted.sort((a, b) => b.id - a.id);
    renderLogs(sorted);
});

document.getElementById('filterDateBtn').addEventListener('click', () => {
    const fromDate = new Date(document.getElementById('fromDate').value);
    const toDate = new Date(document.getElementById('toDate').value);

    if (isNaN(fromDate) || isNaN(toDate)) {
    alert('Please select both From and To dates');
    return;
    }

    const filtered = logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= fromDate && logDate <= toDate;
    });

    renderLogs(filtered);
});

renderLogs(logs);

const ctx = document.getElementById('serviceChart');
const serviceChart = new Chart(ctx, {
    type: 'bar',
    data: {
    labels: ['Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14', 'Oct 15'],
    datasets: [{
        label: 'Service Logs per Day',
        data: [2, 3, 2, 2, 3, 3, 2],
        borderWidth: 1,
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#20c997']
    }]
    },
    options: {
    scales: { y: { beginAtZero: true } }
    }
});

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
