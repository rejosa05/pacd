const {
    notificationPACD
} = window.dashboardConfig;

function fetchPACDNotifications() {
    fetch(notificationPACD, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const countSpan = document.getElementById('notificationCount');
        const count = data.notifications;

        if (count > 0) {
            countSpan.textContent = count;
            countSpan.style.display = 'inline-block'; // Show the badge
        } else {
            countSpan.style.display = 'none'; // Hide the badge
        }
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
    });
}

fetchPACDNotifications();
// Fetch notifications every 10 seconds
setInterval(fetchPACDNotifications, 10000);

// Initial fetch on page load
