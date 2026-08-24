// Theme Toggle - Enhanced Light/Dark Mode
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const THEME_KEY = 'tunestream-theme';

// Initialize theme on page load
function initializeTheme() {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    // Check system preference if no saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine which theme to use
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    // Apply theme with transition
    applyTheme(isDarkMode, true);
}

function applyTheme(isDarkMode, isInitial = false) {
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');
    
    // Add smooth transition class for theme changes
    if (!isInitial) {
        document.documentElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        toggleBtn.innerHTML = `<i class="fas fa-sun" style="color: #FF9F43;"></i>`;
        toggleBtn.title = 'Switch to Light Mode';
        localStorage.setItem(THEME_KEY, 'dark');
    } else {
        body.classList.remove('dark-mode');
        toggleBtn.innerHTML = `<i class="fas fa-moon" style="color: #475569;"></i>`;
        toggleBtn.title = 'Switch to Dark Mode';
        localStorage.setItem(THEME_KEY, 'light');
    }
    
    // Add a subtle animation to the toggle button
    toggleBtn.style.transform = 'scale(0.8)';
    setTimeout(() => {
        toggleBtn.style.transform = 'scale(1)';
    }, 100);
    
    // Reset transition after initial load
    if (isInitial) {
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
}

// Toggle theme on button click with enhanced feedback
themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Add ripple effect
    createRipple(themeToggle);
    
    // Apply new theme
    applyTheme(!isDarkMode);
    
    // Show feedback toast
    const newTheme = !isDarkMode ? '🌙 Dark' : '☀️ Light';
    showThemeToast(`Switched to ${newTheme} Mode`);
});

// Ripple effect for theme toggle
function createRipple(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    ripple.className = 'ripple-effect';
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// Theme toast notification
function showThemeToast(message) {
    const existingToast = document.querySelector('.theme-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto-remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// Add ripple and toast styles
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 107, 107, 0.3);
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleAnim {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    
    .theme-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-secondary-light);
        color: var(--text-primary-light);
        padding: 12px 24px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-md);
        font-weight: 500;
        font-size: 14px;
        z-index: 9999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }
    
    body.dark-mode .theme-toast {
        background: var(--bg-secondary-dark);
        color: var(--text-primary-dark);
        border-color: var(--border-dark);
    }
`;
document.head.appendChild(style);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only change if user hasn't manually set a preference
    if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches);
    }
});
// ---------- GET STARTED BUTTON WITH SCROLL ----------
document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // Check if user is logged in
            const user = localStorage.getItem('tunestream_current_user');
            
            if (user) {
                // If logged in, scroll to music
                const musicSection = document.querySelector('.music-section');
                if (musicSection) {
                    musicSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                // Show welcome back message
                showThemeToast('🎵 Let\'s find your next favorite song!');
            } else {
                // If not logged in, open login modal
                const authModal = document.getElementById('auth-modal-overlay');
                if (authModal) {
                    authModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    // Show login panel
                    document.getElementById('login-panel').classList.remove('hidden');
                    document.getElementById('signup-panel').classList.add('hidden');
                }
            }
        });
    }
});

// Update showThemeToast to work with the theme
function showThemeToast(message) {
    const existingToast = document.querySelector('.theme-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeTheme);