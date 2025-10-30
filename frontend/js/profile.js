// Profile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserInfo();
    setupEventListeners();
});

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('password-form').addEventListener('submit', changePassword);
}

// Load user profile info
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    fetch(`http://localhost:3000/api/users/profile/${user.id}`)
    .then(response => response.json())
    .then(data => {
        if (data.profile) {
            const profile = data.profile;
            document.getElementById('first-name').value = profile.firstName || '';
            document.getElementById('last-name').value = profile.lastName || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('birth-date').value = profile.birthDate || '';
            document.getElementById('gender').value = profile.gender || '';
            document.getElementById('address').value = profile.address || '';
        }
    })
    .catch(error => {
        console.error('Error loading profile:', error);
    });
}

// Update profile
function updateProfile(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const profileData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        phone: document.getElementById('phone').value,
        birthDate: document.getElementById('birth-date').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value
    };
    
    fetch(`http://localhost:3000/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showNotification(data.message, 'success');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showNotification('Profil güncellenirken hata oluştu', 'error');
    });
}

// Change password
function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    fetch(`http://localhost:3000/api/users/change-password/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showNotification(data.message, data.success ? 'success' : 'error');
            if (data.success) {
                document.getElementById('password-form').reset();
            }
        }
    })
    .catch(error => {
        console.error('Error changing password:', error);
        showNotification('Şifre değiştirilirken hata oluştu', 'error');
    });
}

// Show profile section
function showProfileSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.profile-section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Add active to clicked menu item
    event.target.classList.add('active');
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
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

// Make functions global
window.showProfileSection = showProfileSection;
window.logout = logout;