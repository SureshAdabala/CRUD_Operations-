// Check for Admin Role
if (sessionStorage.getItem("role") !== "admin") {
    window.location.href = "login.html"
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? "http://localhost:3000" : "";

async function getData() {
    try {
        let res = await fetch(`${API_BASE}/data`)
        if (!res.ok) {
            throw new Error("Something went Error");
        }
        let data = await res.json()
        fetchData(data)
    } catch (error) {
        console.log(error.message);
    }
}

function fetchData(data) {
    let div = document.getElementById("container");
    div.innerHTML = "";
    data.forEach(ele => {
        let p = document.createElement("p");
        p.innerHTML = `
        <h3>Animal ID: ${ele.id}</h3>
        <h4>Animal Name: ${ele.name}</h4>
        <img src="${ele.image}" alt="${ele.name}">
        <div class="action-buttons">
            <button onclick="editData('${ele.id}','${ele.name}','${ele.image}')">Edit</button>
            <button onclick="deleteData('${ele.id}')">Delete</button>
        </div>`
        div.appendChild(p);
    });
}

//For Deleting Purpose
async function deleteData(id) {
    let res1 = await fetch(`${API_BASE}/data/${id}`, {
        "method": "DELETE"
    });
    alert("Animal Details Removed Succesfully")
    getData();
}

//For Edit purpose
function editData(id, name, image) {
    document.getElementById("id").value = id;
    document.getElementById("name").value = name;
    document.getElementById("image").value = image;
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


//For Add after editing the data and New data Adding
let btn = document.getElementById("saveData")
btn.onclick = async () => {
    let id = document.getElementById("id").value;
    let name = document.getElementById("name").value;
    let image = document.getElementById("image").value;

    if (!id || !name || !image) {
        alert("Please Enter valid ID, Name, URL");
        return;
    }

    let res = await fetch(`${API_BASE}/data/${id}`)
    if (res.ok) {
        let edited = await fetch(`${API_BASE}/data/${id}`, {
            "method": "PATCH",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify({
                name,
                image
            })
        });
        alert("Animal Details New Details added SuccesFully");
    }
    else {
        let newlyAdded = await fetch(`${API_BASE}/data`, {
            "method": "POST",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify({
                id,
                name,
                image
            })
        });
        alert("Animal Details added SuccesFully");
    }
    getData();
}

getData();
fetchUsers();

// --- User Management Functions ---

async function fetchUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);

        if (!res.ok) throw new Error("Failed to fetch users");

        const users = await res.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    ${user.role !== 'admin' ?
                    `<button onclick="deleteUser(${user.id})" class="btn-danger">Delete</button>` :
                    '<span class="badge-admin">Admin</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// --- Toggling Sections ---
function toggleAdminSection() {
    const adminWrapper = document.getElementById('adminWrapper');
    const dataSection = document.getElementById('dataSection');
    const dataListSection = document.getElementById('dataListSection');

    // Toggle Admin Section
    if (adminWrapper.style.display === 'none') {
        adminWrapper.style.display = 'block';
        resetForm(); // Ensure clean state
        // Close Data Sections
        dataSection.style.display = 'none';
        dataListSection.style.display = 'none';
        fetchUsers(); // Refresh list just in case
    } else {
        adminWrapper.style.display = 'none';
        // Show Data Sections (Default view)
        dataSection.style.display = 'block';
        dataListSection.style.display = 'block';
    }
}

// --- Account Management ---

// --- User Management ---

async function fetchUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        const container = document.getElementById('userCardsContainer');
        container.innerHTML = '';

        users.forEach(user => {
            const isDefaultAdmin = user.email === 'sureshadabala0836@gmail.com';

            // Card HTML
            const card = document.createElement('div');
            card.className = 'user-card';

            // Delete button Logic
            const deleteBtn = isDefaultAdmin
                ? ''
                : `<button class="btn-card-delete" onclick="deleteUser('${user.id}')">Delete</button>`;

            // Edit button Logic (Default Admin cannot be edited via UI for safety/requirement)
            const editBtn = isDefaultAdmin
                ? ''
                : `<button class="btn-card-edit" onclick="editUser('${user.id}', '${user.username}', '${user.email}', '${user.role}', '${user.password}')">Edit</button>`;

            card.innerHTML = `
                <div class="user-card-header">
                    <span class="user-card-title">${user.username}</span>
                    <span class="user-card-role role-${user.role}">${user.role}</span>
                </div>
                <div class="user-card-email">${user.email}</div>
                <div class="card-actions">
                    ${editBtn}
                    ${deleteBtn}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Variables to track editing state
let isEditing = false;
let editingUserId = null;

async function createAccount() {
    const username = document.getElementById('newAdminUsername').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPassword').value;
    const role = document.getElementById('newAccountRole').value;

    if (!username || !email || !password) {
        alert("Please fill all required fields");
        return;
    }

    const payload = { username, email, password, role };

    try {
        let res;
        if (isEditing) {
            // Update existing user
            res = await fetch(`${API_BASE}/users/${editingUserId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create new user
            res = await fetch(`${API_BASE}/admin/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const data = await res.json();

        if (res.ok) {
            alert(isEditing ? "Account Updated Successfully!" : `New ${role} Created Successfully!`);
            resetForm();
            fetchUsers();
        } else {
            alert(data.message || "Operation failed");
        }
    } catch (error) {
        console.error(error);
        alert("Error processing request");
    }
}

function editUser(id, username, email, role, password) {
    isEditing = true;
    editingUserId = id;

    document.getElementById('newAdminUsername').value = username;
    document.getElementById('newAdminEmail').value = email;
    document.getElementById('newAdminPassword').value = password; // Populate password
    document.getElementById('newAccountRole').value = role;

    // Change Button Text
    const btn = document.querySelector('#adminSection button[onclick="createAccount()"]');
    btn.innerText = "Update Account";

    // Scroll to form
    document.getElementById('adminSection').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    isEditing = false;
    editingUserId = null;
    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('newAdminPassword').placeholder = "Password";
    document.getElementById('newAccountRole').value = 'admin'; // Default

    const btn = document.querySelector('#adminSection button[onclick="createAccount()"]');
    btn.innerText = "Create Account";
}

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
            alert("User deleted successfully");
            fetchUsers();
        } else {
            alert(data.message || "Failed to delete user");
        }
    } catch (error) {
        console.error(error);
        alert("Error deleting user");
    }
}
