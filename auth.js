document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const demoBtn = document.getElementById('demo-btn');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const email = document.getElementById('email').value;

            setLoading(btn, true);

            // Simulate API call
            setTimeout(() => {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                window.location.href = 'index.html';
            }, 1500);
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button[type="submit"]');

            setLoading(btn, true);

            // Simulate API call
            setTimeout(() => {
                sessionStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'login.html?registered=true';
            }, 1500);
        });
    }

    // Handle Demo Account
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            setLoading(demoBtn, true, '🚀 Logging in...');

            setTimeout(() => {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', 'demo@prepai.com');
                window.location.href = 'index.html';
            }, 1200);
        });
    }

    // Utility: Loading State
    function setLoading(button, isLoading, text = 'Processing...') {
        if (isLoading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<span class="loader-small"></span> ${text}`;
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.originalText;
            button.disabled = false;
        }
    }

    // Check for registration success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('registered')) {
        showGlobalToast('Account created! Please sign in. ✨');
    }
});

// Reuse toast logic from main script or create a simpler version
function showGlobalToast(message) {
    let toast = document.createElement('div');
    toast.className = 'toast active';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '9999';
    toast.innerHTML = `<span class="toast-icon">✓</span> <span class="toast-msg">${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
