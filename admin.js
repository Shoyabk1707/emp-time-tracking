const users = JSON.parse(localStorage.getItem('users')) || [];
let currentEditEmployee = null;

// DOM Elements
const addEmployeeForm = document.getElementById('addEmployeeForm');
const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const editModal = document.getElementById('editModal');
const editEmployeeForm = document.getElementById('editEmployeeForm');
const notification = document.getElementById('notification');

// Render Employee Table
function renderEmployeeTable(filteredUsers = users) {
  employeeTable.innerHTML = '';
  filteredUsers.forEach(user => {
    if (user.role === 'employee') {
      const row = employeeTable.insertRow();
      row.insertCell().textContent = user.name;
      row.insertCell().textContent = user.username;
      row.insertCell().textContent = user.shiftStatus || 'Not Started';
      row.insertCell().innerHTML = `
        <button onclick="openEditModal('${user.username}')">Edit</button>
        <button onclick="deleteEmployee('${user.username}')">Delete</button>
        <button onclick="viewShiftHistory('${user.username}')">View History</button>
      `;
    }
  });
}

// Add Employee
addEmployeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const empName = document.getElementById('empName').value;
  const empUsername = document.getElementById('empUsername').value;
  const empPassword = document.getElementById('empPassword').value;

  const newEmployee = {
    name: empName,
    username: empUsername,
    password: empPassword,
    role: 'employee',
    shiftHistory: []
  };

  users.push(newEmployee);
  localStorage.setItem('users', JSON.stringify(users));
  renderEmployeeTable();
  addEmployeeForm.reset();
  showNotification('Employee added successfully!');
});

// Open Edit Modal
function openEditModal(username) {
  const employee = users.find(user => user.username === username);
  currentEditEmployee = employee;

  document.getElementById('editEmpName').value = employee.name;
  document.getElementById('editEmpUsername').value = employee.username;
  document.getElementById('editEmpPassword').value = employee.password;

  editModal.style.display = 'flex';
}

// Close Edit Modal
editModal.querySelector('.close').addEventListener('click', () => {
  editModal.style.display = 'none';
});

// Edit Employee
editEmployeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const empName = document.getElementById('editEmpName').value;
  const empUsername = document.getElementById('editEmpUsername').value;
  const empPassword = document.getElementById('editEmpPassword').value;

  const userIndex = users.findIndex(user => user.username === currentEditEmployee.username);
  users[userIndex] = { ...users[userIndex], name: empName, username: empUsername, password: empPassword };

  localStorage.setItem('users', JSON.stringify(users));
  renderEmployeeTable();
  editModal.style.display = 'none';
  showNotification('Employee updated successfully!');
});

// Delete Employee
function deleteEmployee(username) {
  const confirmDelete = confirm('Are you sure you want to delete this employee?');
  if (confirmDelete) {
    const userIndex = users.findIndex(user => user.username === username);
    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));
    renderEmployeeTable();
    showNotification('Employee deleted successfully!');
  }
}

// View Shift History
function viewShiftHistory(username) {
    const employee = users.find(user => user.username === username);
    localStorage.setItem('currentEmployee', JSON.stringify(employee));
  
    // Set flag to indicate admin redirection
    localStorage.setItem('adminView', 'true');
    window.location.href = 'employee.html';
  }

  // Render shift history in the Admin Panel
function renderHistory() {
    const employee = JSON.parse(localStorage.getItem('currentEmployee'));
    const historyTable = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
  
    if (!employee || !employee.shiftHistory || employee.shiftHistory.length === 0) {
      historyTable.innerHTML = '<tr><td colspan="4">No shift history available</td></tr>';
      return;
    }
  
    historyTable.innerHTML = '';
    employee.shiftHistory.forEach(shift => {
      const row = historyTable.insertRow();
      row.insertCell().textContent = shift.date;
      row.insertCell().textContent = shift.startTime;
      row.insertCell().textContent = shift.endTime;
      row.insertCell().textContent = shift.totalTime;
    });
  }

  // Function to render shift history for all employees
function renderShiftHistory() {
  const shiftHistoryTable = document.getElementById('shiftHistoryTable').getElementsByTagName('tbody')[0];
  shiftHistoryTable.innerHTML = ''; // Clear existing rows

  users.forEach(user => {
    if (user.role === 'employee' && user.shiftHistory) {
      user.shiftHistory.forEach(shift => {
        const row = shiftHistoryTable.insertRow();
        row.insertCell().textContent = user.name; // Employee name
        row.insertCell().textContent = shift.date; // Date
        row.insertCell().textContent = shift.startTime; // Start time
        row.insertCell().textContent = shift.endTime; // End time
        row.insertCell().textContent = shift.totalTime; // Total time worked
      });
    }
  });
}

// Call this function when the Shift History section is shown
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
  document.getElementById('sectionTitle').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

  // Highlight active sidebar link
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`.sidebar-menu a[onclick="showSection('${sectionId}')"]`).classList.add('active');

  // Render shift history if the section is "history"
  if (sectionId === 'history') {
    renderShiftHistory();
  }
}
  

// Search and Filter
searchInput.addEventListener('input', () => {
  filterEmployees();
});

filterSelect.addEventListener('change', () => {
  filterEmployees();
});

function filterEmployees() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterValue = filterSelect.value;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm) || user.username.toLowerCase().includes(searchTerm);
    const matchesFilter = filterValue === 'all' || user.shiftStatus === filterValue;
    return matchesSearch && matchesFilter;
  });

  renderEmployeeTable(filteredUsers);
}

// Show Notification
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.classList.toggle('error', isError);
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Initial Render
renderEmployeeTable();

// Show Section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    document.getElementById('sectionTitle').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  
    // Highlight active sidebar link
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`.sidebar-menu a[onclick="showSection('${sectionId}')"]`).classList.add('active');
  }
  
  // Logout
  function logout() {
    localStorage.removeItem('currentEmployee');
    localStorage.removeItem('adminView'); // Remove admin flag on logout
    window.location.href = 'index.html';
  }

// Function to update employee status in admin panel
function updateEmployeeStatus() {
    const employeeStatus = JSON.parse(localStorage.getItem('employeeStatus'));
    
    if (employeeStatus) {
      const statusText = document.getElementById('employeeStatus');
      statusText.textContent = `Employee Status: ${employeeStatus.shiftStatus}`;
    }
  }
  

// Polling every 2 seconds to update employee status on admin panel
setInterval(updateEmployeeStatus, 2000);

// On page load, immediately update employee status
updateEmployeeStatus();

  
// Initial Render
showSection('dashboard');
renderEmployeeTable();
