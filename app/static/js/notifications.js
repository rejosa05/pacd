const {
    notification
} = window.dashboardConfig || {};

let lastNotificationCount = 0;
let notificationSound;

function setNavbarNotificationCount(count) {
    const badge = document.getElementById('notify');
    if (!badge) return;

    const safeCount = Number(count) || 0;
    badge.textContent = String(safeCount);
    badge.style.display = safeCount > 0 ? 'inline-flex' : 'none';
}

window.setNavbarNotificationCount = setNavbarNotificationCount;

// Enable sound on first interaction
document.addEventListener('click', () => {
    if (!notificationSound) {
        notificationSound = new Audio('/static/audio/notify.mp3');
        notificationSound.load();
    }
}, { once: true });

function fetchPACDNotifications() {
    if (!notification) return;

    fetch(notification, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
        const count = Number(data.notifications || 0);
        setNavbarNotificationCount(count);

        if (count > lastNotificationCount && notificationSound) {
            showNewNotificationAlert(count - lastNotificationCount);
        }

        lastNotificationCount = count;
    })
    .catch(console.error);
}

window.fetchPACDNotifications = fetchPACDNotifications;

function showNewNotificationAlert(newCount) {
    if (notificationSound) {
        notificationSound.play().catch(err => {
            console.warn('Playback blocked:', err);
        });
    }
}

if (typeof window !== 'undefined' && ["dashboard", "transaction", "reports", "account", "services"].some(keyword => window.location.pathname.includes(keyword))) {
    fetchPACDNotifications();
    setInterval(fetchPACDNotifications, 3000);
}




