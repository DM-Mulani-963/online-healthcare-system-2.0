/**
 * Authentication State Management
 * This module handles authentication state across the application
 */
import { onAuthStateChange, logoutUser } from './auth.js';

// Elements that should be visible only when logged in
const authElements = document.querySelectorAll('.auth-required');
// Elements that should be visible only when logged out
const guestElements = document.querySelectorAll('.guest-only');
// Elements that should show user info when logged in
const userNameElements = document.querySelectorAll('.user-name');
const userEmailElements = document.querySelectorAll('.user-email');
const userTypeElements = document.querySelectorAll('.user-type');

// Function to handle logout
const handleLogout = async (e) => {
    if (e) e.preventDefault();
    
    try {
        const result = await logoutUser();
        if (result.success) {
            // Redirect to home page after logout
            window.location.href = '/frontend/index.html';
        } else {
            console.error('Logout failed:', result.error);
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout. Please try again.');
    }
};

// Function to update UI based on authentication state
const updateUI = (authState) => {
    if (authState.isLoggedIn) {
        // User is logged in
        const userData = authState.userData || {};
        const userName = userData.name || authState.user.displayName || 'User';
        const userEmail = userData.email || authState.user.email || '';
        const userType = userData.userType || 'user';
        
        // Show auth-required elements
        authElements.forEach(el => el.style.display = '');
        
        // Hide guest-only elements
        guestElements.forEach(el => el.style.display = 'none');
        
        // Update user info elements
        userNameElements.forEach(el => el.textContent = userName);
        userEmailElements.forEach(el => el.textContent = userEmail);
        userTypeElements.forEach(el => el.textContent = userType);
        
        // Add logout event listeners
        document.querySelectorAll('.logout-btn').forEach(btn => {
            // Remove any existing listeners to prevent duplicates
            btn.removeEventListener('click', handleLogout);
            // Add fresh listener
            btn.addEventListener('click', handleLogout);
        });
        
        // Handle page-specific restrictions based on user type
        const currentPage = window.location.pathname.split('/').pop();
        
        // Redirect if user doesn't have permission to access the page
        if ((currentPage === 'doctor-dashboard.html' && userType !== 'doctor') ||
            (currentPage === 'patient-dashboard.html' && userType !== 'patient') ||
            (currentPage === 'admin-dashboard.html' && userType !== 'admin')) {
            
            // Redirect to appropriate dashboard
            switch (userType) {
                case 'doctor':
                    window.location.href = '/frontend/doctor-dashboard.html';
                    break;
                case 'patient':
                    window.location.href = '/frontend/patient-dashboard.html';
                    break;
                case 'admin':
                    window.location.href = '/frontend/admin-dashboard.html';
                    break;
                default:
                    window.location.href = '/frontend/index.html';
            }
        }
    } else {
        // User is logged out
        
        // Hide auth-required elements
        authElements.forEach(el => el.style.display = 'none');
        
        // Show guest-only elements
        guestElements.forEach(el => el.style.display = '');
        
        // Handle page-specific restrictions for unauthenticated users
        const currentPage = window.location.pathname.split('/').pop();
        const restrictedPages = [
            'doctor-dashboard.html',
            'patient-dashboard.html',
            'admin-dashboard.html',
            'appointments-manage.html',
            'profile.html'
        ];
        
        // Redirect if user tries to access restricted page while logged out
        if (restrictedPages.includes(currentPage)) {
            window.location.href = '/frontend/login.html';
        }
    }
};

// Initialize auth state listener
const unsubscribe = onAuthStateChange(updateUI);

// Clean up listener when page unloads
window.addEventListener('unload', () => {
    if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
    }
}); 