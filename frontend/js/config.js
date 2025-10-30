// Dynamic URL configuration
const BASE_URL = window.location.origin;

// Replace all hardcoded localhost URLs
document.addEventListener('DOMContentLoaded', function() {
    // Update all links
    const links = document.querySelectorAll('a[href*="localhost:3000"]');
    links.forEach(link => {
        link.href = link.href.replace('http://localhost:3000', '');
    });
    
    // Update onclick handlers
    const buttons = document.querySelectorAll('[onclick*="localhost:3000"]');
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        button.setAttribute('onclick', onclick.replace(/http:\/\/localhost:3000/g, ''));
    });
    
    // Force update navigation
    setTimeout(() => {
        document.querySelectorAll('a, [onclick]').forEach(el => {
            if (el.href && el.href.includes('localhost:3000')) {
                el.href = el.href.replace('http://localhost:3000', '');
            }
            if (el.onclick && el.onclick.toString().includes('localhost:3000')) {
                const newOnclick = el.onclick.toString().replace(/http:\/\/localhost:3000/g, '');
                el.setAttribute('onclick', newOnclick.replace('function onclick(event) { ', '').replace(' }', ''));
            }
        });
    }, 100);
});