// Initialize employee data
let employee = JSON.parse(localStorage.getItem('currentEmployee'));
const users = JSON.parse(localStorage.getItem('users')) || [];

// Check if employee data exists
if (!employee) {
    alert('No employee data found. Redirecting to login...');
    localStorage.removeItem('adminView'); // Ensure clean login if accessed incorrectly
    window.location.href = 'index.html';
} else {
    // Ensure shiftHistory exists
    employee.shiftHistory = employee.shiftHistory || [];
    
    // Update UI only if elements exist
    const empNameEl = document.getElementById('empName');
    const empUsernameEl = document.getElementById('empUsername');
    
    if (empNameEl) empNameEl.textContent = `Name: ${employee.name}`;
    if (empUsernameEl) empUsernameEl.textContent = `Username: ${employee.username}`;
}
  

// Timer variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isPaused = false;
let isTracking = false;
let screenshotIntervalId = null; // Store interval ID for screenshots

// DOM elements
const statusText = document.getElementById('status');
const timeWorkedText = document.getElementById('timeWorked');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const historyTable = document.getElementById('historyTable').getElementsByTagName('tbody')[0];

// Download Data Button
document.getElementById('downloadDataBtn').addEventListener('click', () => {
  downloadTimeTrackedData();
});

// Function to download time-tracked data as Excel
function downloadTimeTrackedData() {
  // Prepare data for the Excel file
  const data = [
    ["Employee Name","Date", "Start Time", "End Time", "Total Time Worked"]
  ];

  employee.shiftHistory.forEach(shift => {
    data.push([
      employee.name,
      shift.date,
      shift.startTime,
      shift.endTime,
      shift.totalTime,
    ]);
  });

  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Time Tracked Data");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `TimeTrackedData_${employee.username}.xlsx`);
}

// Check if there's saved time and shift status in localStorage on page load
const savedData = JSON.parse(localStorage.getItem('employeeData'));
if (savedData) {
  startTime = savedData.startTime;
  elapsedTime = savedData.elapsedTime;
  isTracking = savedData.isTracking;
  isPaused = savedData.isPaused;

 // Update UI with saved data
 timeWorkedText.textContent = `Time Worked: ${formatTime(elapsedTime)}`;
 statusText.textContent = `Status: ${savedData.shiftStatus}`;
 startBtn.disabled = savedData.isTracking;
 pauseBtn.disabled = !savedData.isTracking || savedData.isPaused;
 stopBtn.disabled = !savedData.isTracking;
}

// Helper function to format time
function formatTime(milliseconds) {
  let totalSeconds = Math.floor(milliseconds / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update the time worked display
function updateTime() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    timeWorkedText.textContent = `Time Worked: ${formatTime(elapsedTime)}`;
    // Save data to localStorage continuously
    localStorage.setItem('employeeData', JSON.stringify({
      startTime: startTime,
      elapsedTime: elapsedTime,
      shiftStatus: employee.shiftStatus,
      isTracking: isTracking,
      isPaused: isPaused
    }));
  }

// Render shift history
function renderHistory() {
  historyTable.innerHTML = '';
  employee.shiftHistory.forEach(shift => {
    const row = historyTable.insertRow();
    row.insertCell().textContent = shift.date;
    row.insertCell().textContent = shift.startTime;
    row.insertCell().textContent = shift.endTime;
    row.insertCell().textContent = shift.totalTime;
  });
}

// Start shift
startBtn.addEventListener('click', () => {
  if (!isTracking) {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTime, 1000);
    statusText.textContent = 'Status: Working';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;

    // Update shift status
    employee.shiftStatus = 'Working';
    updateEmployeeInUsers();
    isTracking = true;

    // Save time data to localStorage
    localStorage.setItem('employeeData', JSON.stringify({
      startTime: startTime,
      elapsedTime: elapsedTime,
      shiftStatus: employee.shiftStatus,
      isTracking: isTracking,
      isPaused: isPaused
    }));

    startScreenshots(); // Start taking screenshots
  }
});

// Pause/Resume shift
pauseBtn.addEventListener('click', () => {
    if (isPaused) {
      startTime = Date.now() - elapsedTime;
      timerInterval = setInterval(updateTime, 1000);
      statusText.textContent = 'Status: Working';
      pauseBtn.textContent = 'Pause Shift';
      employee.shiftStatus = 'Working';
      isPaused = false;
      startScreenshots(); // Start taking screenshots
    } else {
      clearInterval(timerInterval);
      statusText.textContent = 'Status: Paused';
      pauseBtn.textContent = 'Resume Shift';
      employee.shiftStatus = 'Paused';
      isPaused = true;
      stopScreenshots(); // Stop taking screenshots
    }
    // Update employee status in localStorage
    localStorage.setItem('employeeData', JSON.stringify({
      startTime: startTime,
      elapsedTime: elapsedTime,
      shiftStatus: employee.shiftStatus,
      isTracking: isTracking,
      isPaused: isPaused
    }));

    
  });
  

// Stop shift
stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    const endTime = new Date().toLocaleTimeString();
    const totalTime = formatTime(elapsedTime);
  
    // Save shift data
    const shiftData = {
      date: new Date().toLocaleDateString(),
      startTime: new Date(startTime).toLocaleTimeString(),
      endTime: endTime,
      totalTime: totalTime,
    };


  
    employee.shiftHistory.push(shiftData);
    employee.shiftStatus = 'Not Started';
    updateEmployeeInUsers();
  
 // Update UI and reset timer
  statusText.textContent = 'Status: Shift Ended';
  timeWorkedText.textContent = `Time Worked: ${totalTime}`;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  elapsedTime = 0;
  isPaused = false;
  pauseBtn.textContent = 'Pause Shift';

  
    // Render updated history
    renderHistory();
  
    // Clear saved data from localStorage after shift ends
    localStorage.removeItem('employeeData');

    stopScreenshots(); // Stop taking screenshots
  });

// Function to update employee status in localStorage
function updateEmployeeStatusInLocalStorage() {
    const currentEmployeeStatus = {
      username: employee.username,
      shiftStatus: employee.shiftStatus,
    };
    localStorage.setItem('employeeStatus', JSON.stringify(currentEmployeeStatus));
  }


// Function to update employee data in localStorage
function updateEmployeeInUsers() {
    const userIndex = users.findIndex(user => user.username === employee.username);
    if (userIndex !== -1) {
        users[userIndex] = employee;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Render history on page load
renderHistory();

// Check if accessed from admin panel
if (localStorage.getItem('adminView') === 'true') {
    document.getElementById('backToAdminBtn').style.display = 'block';
  } else {
    document.getElementById('backToAdminBtn').style.display = 'none';
  }
  

// Back to Admin
document.getElementById('backToAdminBtn').addEventListener('click', () => {
  window.location.href = 'admin.html';
});

// Logout
function logout() {
  localStorage.removeItem('currentEmployee');
  localStorage.removeItem('adminView');
  window.location.href = 'index.html';
}


// Function to capture screenshot
function captureScreenshot() {
  html2canvas(document.body).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      downloadScreenshot(imgData);
  });
}

function downloadScreenshot(imgData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const a = document.createElement("a");
  a.href = imgData;
  a.download = `screenshot_${timestamp}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function startScreenshots() {
  if (!screenshotIntervalId) {
      screenshotIntervalId = setInterval(() => {
          if (isTracking && !isPaused) {
              captureScreenshot();
          }
      }, 1 * 60 * 1000); // Capture screenshot every 10 minutes
  }
}

function stopScreenshots() {
  if (screenshotIntervalId) {
      clearInterval(screenshotIntervalId);
      screenshotIntervalId = null;
  }
}


// Attach logout function to the logout button
document.getElementById('logoutBtn').addEventListener('click', logout);
