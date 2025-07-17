const {
    notification
} = window.dashboardConfig;

let lastNotificationCount = 0;
let notificationSound;

// Enable sound on first interaction
document.addEventListener('click', () => {
    if (!notificationSound) {
        notificationSound = new Audio('/static/audio/notify.mp3');
        notificationSound.load();
        console.log('🔔 Sound ready');
    }
}, { once: true });

function fetchPACDNotifications() {
    fetch(notification, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
        const count = data.notifications;
        const badge = document.getElementById('notify');

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        if (count > lastNotificationCount && notificationSound) {
            showNewNotificationAlert(count - lastNotificationCount);
        }

        lastNotificationCount = count;
    })
    .catch(console.error);
}

function showNewNotificationAlert(newCount) {
    if (notificationSound) {
        notificationSound.play().catch(err => {
            console.warn('Playback blocked:', err);
        });
    }
}

if (["dashboard", "transaction", "reports", "account"].some(keyword => path.includes(keyword))) {
    fetchPACDNotifications();
    setInterval(fetchPACDNotifications, 3000);
}




