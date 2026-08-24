// =============================================================
// TUNESTREAM AUTH (FRONT-END ONLY — TEMPORARY)
// =============================================================

// ---------- ELEMENTS ----------
const authModalOverlay = document.getElementById('auth-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');

const loginPanel = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

const authArea = document.getElementById('auth-area');
const getStartedBtn = document.getElementById('get-started-btn');

// ---------- MODAL OPEN / CLOSE ----------
function openModal(showSignup = false) {
    authModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (showSignup) {
        loginPanel.classList.add('hidden');
        signupPanel.classList.remove('hidden');
    } else {
        signupPanel.classList.add('hidden');
        loginPanel.classList.remove('hidden');
    }
    loginError.textContent = '';
    signupError.textContent = '';
}

function closeModal() {
    authModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    loginForm.reset();
    signupForm.reset();
}

// Close when clicking outside the card
authModalOverlay.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Switch between panels
if (switchToSignup) {
    switchToSignup.addEventListener('click', () => openModal(true));
}
if (switchToLogin) {
    switchToLogin.addEventListener('click', () => openModal(false));
}

// Modal close button
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
}

// ---------- GET STARTED BUTTON ----------
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
        const user = getCurrentUser();
        if (user) {
            showToast(`Welcome back, ${user.name}! 🎵`, 'success');
            // Scroll to music section
            const musicSection = document.querySelector('.music-section');
            if (musicSection) {
                musicSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } else {
            openModal(false);
        }
    });
}

// =================================================================
// DJANGO SWAP POINT #1: signUpUser
// =================================================================
function signUpUser(name, email, password) {
    const users = JSON.parse(localStorage.getItem('tunestream_users') || '[]');

    if (users.some(u => u.email === email)) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('tunestream_users', JSON.stringify(users));

    return { success: true, message: 'Account created! 🎉', user: { name, email } };
}

// =================================================================
// DJANGO SWAP POINT #2: logInUser
// =================================================================
function logInUser(email, password) {
    const users = JSON.parse(localStorage.getItem('tunestream_users') || '[]');
    const match = users.find(u => u.email === email && u.password === password);

    if (!match) {
        return { success: false, message: 'Incorrect email or password.' };
    }

    return { success: true, message: 'Welcome back! 🎵', user: { name: match.name, email: match.email } };
}

// =================================================================
// DJANGO SWAP POINT #3: logOutUser
// =================================================================
function logOutUser() {
    localStorage.removeItem('tunestream_current_user');
    renderAuthArea();
    showToast('Logged out successfully', 'info');
}

// ---------- SESSION HELPERS ----------
function setCurrentUser(user) {
    localStorage.setItem('tunestream_current_user', JSON.stringify(user));
    renderAuthArea();
    showToast(`Welcome, ${user.name}! 🎵`, 'success');
}

function getCurrentUser() {
    const raw = localStorage.getItem('tunestream_current_user');
    return raw ? JSON.parse(raw) : null;
}

// ---------- TOAST NOTIFICATION ----------
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">×</button>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    });
}

// ---------- RENDER AUTH UI ----------
function renderAuthArea() {
    const user = getCurrentUser();

    if (user) {
        const initial = user.name.trim().charAt(0).toUpperCase();
        const colors = ['#FF6B6B', '#FF9F43', '#A78BFA', '#4ECDC4', '#45B7D1'];
        const colorIndex = user.name.length % colors.length;
        const avatarColor = colors[colorIndex];
        
        authArea.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar" style="background: ${avatarColor};">
                    ${initial}
                    <span class="avatar-status"></span>
                </div>
                <span class="user-name">${user.name}</span>
            </div>
            <button class="logout-btn" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Log out
            </button>
        `;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logOutUser);
        }
    } else {
        authArea.innerHTML = `
            <a href="#" id="signup-link" class="auth-link">Sign up</a>
            <button class="auth-btn" id="login-btn">Log in</button>
        `;
        const loginBtn = document.getElementById('login-btn');
        const signupLink = document.getElementById('signup-link');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => openModal(false));
        }
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(true);
            });
        }
    }
}

// ---------- FORM SUBMIT HANDLERS ----------
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const submitBtn = loginForm.querySelector('.modal-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const result = logInUser(email, password);

            if (result.success) {
                setCurrentUser(result.user);
                closeModal();
            } else {
                loginError.textContent = result.message;
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 500);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        const submitBtn = signupForm.querySelector('.modal-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        setTimeout(() => {
            const result = signUpUser(name, email, password);

            if (result.success) {
                setCurrentUser(result.user);
                closeModal();
            } else {
                signupError.textContent = result.message;
                signupForm.classList.add('shake');
                setTimeout(() => signupForm.classList.remove('shake'), 500);
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 500);
    });
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', renderAuthArea);