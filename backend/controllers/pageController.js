const path = require('path');

/**
 * @desc    Serve the home page
 * @route   GET /
 * @access  Public
 */
exports.getHomePage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/index.html'));
};

/**
 * @desc    Serve the about page
 * @route   GET /about
 * @access  Public
 */
exports.getAboutPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/about.html'));
};

/**
 * @desc    Serve the services page
 * @route   GET /services
 * @access  Public
 */
exports.getServicesPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/services.html'));
};

/**
 * @desc    Serve the doctors page
 * @route   GET /doctors
 * @access  Public
 */
exports.getDoctorsPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/doctors.html'));
};

/**
 * @desc    Serve the appointments page
 * @route   GET /appointments
 * @access  Public
 */
exports.getAppointmentsPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/appointments.html'));
};

/**
 * @desc    Serve the contact page
 * @route   GET /contact
 * @access  Public
 */
exports.getContactPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/contact.html'));
};

/**
 * @desc    Serve the login page
 * @route   GET /login
 * @access  Public
 */
exports.getLoginPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/login.html'));
};

/**
 * @desc    Serve the register page
 * @route   GET /register
 * @access  Public
 */
exports.getRegisterPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/register.html'));
};

/**
 * @desc    Serve the dashboard page
 * @route   GET /dashboard
 * @access  Private
 */
exports.getDashboardPage = (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/dashboard.html'));
};
