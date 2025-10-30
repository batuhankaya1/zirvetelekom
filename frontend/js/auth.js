// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.userId) {
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify({
                id: data.userId,
                name: data.name,
                email: email
            }));
            
            showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Redirect to homepage
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        } else {
            showNotification(data.message || 'Giriş başarısız', 'error');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Bağlantı hatası', 'error');
    });
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.userId) {
            showNotification('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showNotification(data.message || 'Kayıt başarısız', 'error');
        }
    })
    .catch(error => {
        console.error('Register error:', error);
        showNotification('Bağlantı hatası', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
        border-radius: 5px; color: white; font-weight: bold; z-index: 10000;
        animation: slideIn 0.3s ease; max-width: 300px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

// Add CSS for notification animation
if (!document.querySelector('#notification-css')) {
    const style = document.createElement('style');
    style.id = 'notification-css';
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }';
    document.head.appendChild(style);
}