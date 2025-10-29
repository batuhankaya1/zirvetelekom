// Database Viewer JavaScript
let currentTable = 'products';

// Initialize database viewer
document.addEventListener('DOMContentLoaded', function() {
    showTable('products');
});

// Show table data
function showTable(tableName) {
    currentTable = tableName;
    
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(tableName)) {
            item.classList.add('active');
        }
    });
    
    // Hide query section
    document.getElementById('query-section').style.display = 'none';
    
    // Update title
    document.getElementById('table-title').textContent = `${tableName.toUpperCase()} Table`;
    
    // Load table data
    loadTableData(tableName);
}

// Load table data from backend
function loadTableData(tableName) {
    let endpoint = '';
    
    switch(tableName) {
        case 'products':
            endpoint = 'http://localhost:3000/api/products';
            break;
        case 'orders':
            endpoint = 'http://localhost:3000/api/orders';
            break;
        case 'order_items':
            endpoint = 'http://localhost:3000/api/order-items';
            break;
        default:
            console.error('Unknown table:', tableName);
            displayError('Bilinmeyen tablo: ' + tableName);
            return;
    }
    
    fetch(endpoint)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Loaded data for', tableName, ':', data);
        displayTableData(data, tableName);
        updateTableInfo(data.length);
    })
    .catch(error => {
        console.error('Error loading table data:', error);
        displayError('Veri yüklenirken hata oluştu: ' + error.message);
    });
}

// Display table data
function displayTableData(data, tableName) {
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    
    // Clear existing content
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 2rem;">Veri bulunamadı</td></tr>';
        return;
    }
    
    // Create headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.toUpperCase();
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    
    // Create rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            let value = row[header];
            
            // Format different data types
            if (value === null || value === undefined) {
                value = 'NULL';
                td.style.color = '#999';
                td.style.fontStyle = 'italic';
            } else if (typeof value === 'number' && header.includes('price')) {
                value = formatPrice(value);
            } else if (header.includes('created_at') || header.includes('updated_at')) {
                value = formatDate(value);
            }
            
            td.textContent = value;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Display error message
function displayError(message) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = `<tr><td colspan="100%" style="text-align: center; padding: 2rem; color: #ef4444;">${message}</td></tr>`;
}

// Update table info
function updateTableInfo(rowCount) {
    document.getElementById('row-count').textContent = `${rowCount} kayıt`;
    document.getElementById('last-updated').textContent = `Son güncelleme: ${new Date().toLocaleString('tr-TR')}`;
}

// Refresh current table
function refreshTable() {
    if (currentTable) {
        loadTableData(currentTable);
    }
}

// Export table data
function exportTable() {
    const table = document.getElementById('data-table');
    let csv = '';
    
    // Get headers
    const headers = [];
    table.querySelectorAll('th').forEach(th => {
        headers.push(th.textContent);
    });
    csv += headers.join(',') + '\\n';
    
    // Get data rows
    table.querySelectorAll('tbody tr').forEach(tr => {
        const row = [];
        tr.querySelectorAll('td').forEach(td => {
            row.push('"' + td.textContent.replace(/"/g, '""') + '"');
        });
        csv += row.join(',') + '\\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Show custom query section
function executeCustomQuery() {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show query section
    document.getElementById('query-section').style.display = 'block';
    document.getElementById('table-title').textContent = 'Custom Query';
    
    // Clear table
    document.getElementById('table-head').innerHTML = '';
    document.getElementById('table-body').innerHTML = '';
}

// Run custom query
function runQuery() {
    const query = document.getElementById('custom-query').value.trim();
    
    if (!query) {
        alert('Lütfen bir SQL sorgusu girin');
        return;
    }
    
    // For security, only allow SELECT queries
    if (!query.toLowerCase().startsWith('select')) {
        alert('Güvenlik nedeniyle sadece SELECT sorguları çalıştırılabilir');
        return;
    }
    
    fetch('http://localhost:3000/api/database/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            displayError(data.error);
        } else {
            displayTableData(data.results, 'custom');
            updateTableInfo(data.results.length);
        }
    })
    .catch(error => {
        console.error('Error running query:', error);
        displayError('Sorgu çalıştırılırken hata oluştu: ' + error.message);
    });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(price);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('tr-TR');
}

// Make functions global
window.showTable = showTable;
window.refreshTable = refreshTable;
window.exportTable = exportTable;
window.executeCustomQuery = executeCustomQuery;
window.runQuery = runQuery;