const users = JSON.parse(localStorage.getItem('users')) || [];
const admin = { username: 'admin', password: 'admin123', role: 'admin' };

// Add admin if not already added
if (!users.find(user => user.role === 'admin')) {
  users.push(admin);
  localStorage.setItem('users', JSON.stringify(users));
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      localStorage.setItem('currentEmployee', JSON.stringify(user));
      window.location.href = 'employee.html';
    }
  } else {
    document.getElementById('error').textContent = 'Invalid username or password';
  }
});