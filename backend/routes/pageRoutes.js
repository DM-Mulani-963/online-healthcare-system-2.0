const express = require('express');
const { 
  getHomePage,
  getAboutPage,
  getServicesPage,
  getDoctorsPage,
  getAppointmentsPage,
  getContactPage,
  getLoginPage,
  getRegisterPage,
  getDashboardPage
} = require('../controllers/pageController');

const { protect } = require('../middleware/auth');
const { checkAuthentication, serveHtmlPage, handleNotFound } = require('../middleware/pageMiddleware');

const router = express.Router();

// Public pages
router.get('/', serveHtmlPage('index'));
router.get('/about', serveHtmlPage('about'));
router.get('/services', serveHtmlPage('services'));
router.get('/doctors', serveHtmlPage('doctors'));
router.get('/appointments', serveHtmlPage('appointments'));
router.get('/contact', serveHtmlPage('contact'));
router.get('/login', serveHtmlPage('login'));
router.get('/register', serveHtmlPage('register'));
router.get('/faq', serveHtmlPage('faq'));
router.get('/testimonials', serveHtmlPage('testimonials'));
router.get('/blog', serveHtmlPage('blog'));
router.get('/terms', serveHtmlPage('terms'));
router.get('/privacy', serveHtmlPage('privacy'));

// Protected pages
router.get('/dashboard', protect, serveHtmlPage('dashboard'));
router.get('/profile', protect, serveHtmlPage('profile'));
router.get('/medical-records', protect, serveHtmlPage('medical-records'));
router.get('/prescriptions', protect, serveHtmlPage('prescriptions'));
router.get('/payments', protect, serveHtmlPage('payments'));

// Handle 404 for page routes
router.use(handleNotFound);

module.exports = router;
