function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderActivityLogs(logs) {
    const body = document.getElementById('activityLogBody');
    const searchText = document.getElementById('activitySearch').value.trim().toLowerCase();
    body.innerHTML = '';

    const filteredLogs = logs.filter(log => {
        const joined = [log.user, log.action, log.description, log.page, log.ip_address, log.session_key].join(' ').toLowerCase();
        return joined.includes(searchText);
    });

    if (filteredLogs.length === 0) {
        body.innerHTML = '<tr><td colspan="7">No activity logs found.</td></tr>';
        return;
    }

    filteredLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.user || ''}</td>
            <td>${log.description || ''}</td>
            <td>${log.session_key || ''}</td>
            <td>${formatDateTime(log.date)}</td>
        `;
        body.appendChild(row);
    });
}

function fetchActivityLogs() {
    const endpoint = window.activityLogsApi || '/get-activity-logs/';
    fetch(endpoint, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const logs = data.activity_logs || [];
        window.activityLogs = logs;
        renderActivityLogs(logs);
    })
    .catch(() => {
        const body = document.getElementById('activityLogBody');
        if (body) {
            body.innerHTML = '<tr><td colspan="7">Unable to load activity logs.</td></tr>';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('activitySearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (window.activityLogs) {
                renderActivityLogs(window.activityLogs);
            }
        });
    }
    fetchActivityLogs();
});
