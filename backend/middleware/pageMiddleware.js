const path = require('path');
const fs = require('fs');

/**
 * Middleware to check if a user is authenticated before accessing protected pages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.checkAuthentication = (req, res, next) => {
  // Check if user is authenticated (has a valid token in cookies or session)
  if (req.user) {
    next();
  } else {
    // Redirect to login page if not authenticated
    res.redirect('/login');
  }
};

/**
 * Middleware to serve static HTML pages with proper headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.serveHtmlPage = (pageName) => {
  return (req, res, next) => {
    const filePath = path.resolve(__dirname, `../../frontend/${pageName}.html`);
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next(new Error(`Page ${pageName} not found`));
    }
  };
};

/**
 * Middleware to handle 404 errors for HTML pages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleNotFound = (req, res) => {
  const notFoundPath = path.resolve(__dirname, '../../frontend/404.html');
  
  // Check if a custom 404 page exists
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
  } else {
    // If no custom 404 page, send a basic 404 response
    res.status(404).send('Page not found');
  }
};
