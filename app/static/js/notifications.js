const {
    notificationPACD, notificationUNIT
} = window.dashboardConfig;

function fetchPACDNotifications() {
    fetch(notificationPACD, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest'}
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

function fetchUNITNotifications() {
    fetch(notificationUNIT, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.json())
    .then(data => {
        const countSpan = document.getElementById('notificationCountUNIT');
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

const keywords = [unitTransactions, unitDashboard];

if (path.includes(pacdTransactions)) {
    fetchPACDNotifications();
    setInterval(fetchPACDNotifications, 2000);
}

if (keywords.some(keyword => path.includes(keyword))) {
    fetchUNITNotifications();
    setInterval(fetchUNITNotifications, 2000);
}



