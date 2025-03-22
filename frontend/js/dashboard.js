// Dashboard Interactions and Animations

document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Handle user menu dropdown
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', function() {
            userMenu.classList.toggle('active');
            userMenu.classList.toggle('hidden');
        });
        
        // Close user menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.remove('active');
                userMenu.classList.add('hidden');
            }
        });
    }
    
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('expanded');
        });
        
        // Close sidebar when clicking on overlay (mobile)
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('expanded');
            });
        }
        
        // Close sidebar when clicking on menu item (mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar-menu-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 640) {
                    sidebar.classList.remove('expanded');
                }
            });
        });
    }
    
    // Theme toggler functionality
    const themeToggle = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    
    // Check for saved theme preference or use device preference
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark-mode');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark-mode');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
    }
    
    // Toggle theme when button is clicked
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Toggle icons
            darkIcon.classList.toggle('hidden');
            lightIcon.classList.toggle('hidden');
            
            // Toggle dark mode class
            document.documentElement.classList.toggle('dark-mode');
            
            // Update localStorage
            if (document.documentElement.classList.contains('dark-mode')) {
                localStorage.setItem('color-theme', 'dark');
            } else {
                localStorage.setItem('color-theme', 'light');
            }
        });
    }
    
    // Add animation classes to elements as they scroll into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.card:not(.animated)');
        
        elements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top <= windowHeight * 0.8) {
                setTimeout(() => {
                    element.classList.add('fade-in', 'animated');
                }, index * 100);
            }
        });
    };
    
    // Run the animation check on initial load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Sample data for demo purposes - replace with real data in production
    populateSampleData();
});

// Function to populate sample data for demo purposes
function populateSampleData() {
    // Only run on dashboard pages
    if (!document.querySelector('.stat-value')) return;
    
    // Animate counting up for stat values
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const targetValue = Math.floor(Math.random() * 100);
        animateCounter(stat, 0, targetValue, 1500);
    });
    
    // Function to animate a counter from start to end
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
} 