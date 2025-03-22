/**
 * Navigation and Authentication Handling
 * This script handles client-side navigation and authentication for the healthcare system
 */

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Get user role
function getUserRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || 'guest';
}

// Handle navigation based on authentication status
function handleProtectedNavigation() {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/medical-records',
    '/prescriptions',
    '/payments'
  ];

  const currentPath = window.location.pathname;
  
  // If on a protected route and not logged in, redirect to login
  if (protectedRoutes.includes(currentPath) && !isLoggedIn()) {
    window.location.href = '/login';
    return;
  }
  
  // Update UI based on authentication status
  updateNavigation();
}

// Update navigation UI based on authentication status
function updateNavigation() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-menu');
  
  if (isLoggedIn()) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenuBtn) userMenuBtn.style.display = 'flex';
    
    // Update user name in menu
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && user.name) {
      userNameElement.textContent = user.name;
    }
    
    // Show/hide elements based on user role
    const role = getUserRole();
    document.querySelectorAll('[data-role]').forEach(el => {
      const allowedRoles = el.dataset.role.split(',');
      if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
    if (userMenuBtn) userMenuBtn.style.display = 'none';
    if (userMenu) userMenu.classList.add('hidden');
    
    // Hide elements that require authentication
    document.querySelectorAll('[data-role]').forEach(el => {
      const allowedRoles = el.dataset.role.split(',');
      if (allowedRoles.includes('guest') || allowedRoles.includes('all')) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  }
}

// Handle logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Toggle user menu
function toggleUserMenu() {
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    userMenu.classList.toggle('hidden');
  }
}

// Toggle mobile menu
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// Toggle dark mode
function toggleDarkMode() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status and update UI
  handleProtectedNavigation();
  
  // Add event listeners
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  const userMenuBtn = document.getElementById('user-menu-btn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', toggleUserMenu);
  }
  
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  const darkModeBtn = document.getElementById('dark-mode-btn');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
  }
});

// Export functions for use in other scripts
window.healthcareApp = {
  isLoggedIn,
  getUserRole,
  logout,
  toggleUserMenu,
  toggleMobileMenu,
  toggleDarkMode
};
