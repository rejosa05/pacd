let allClient = [];
let pageSize = 10;
let currentPage = 1;

function initials(name) {
    return String(name || '')
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function updateSummaryStats() {
    const total = allClient.length;
    const waiting = allClient.filter(client => (client.status || 'Waiting') === 'Waiting').length;
    const priority = allClient.filter(client => String(client.lane || '').toLowerCase() === 'priority').length;

    const totalEl = document.getElementById('statTotalClients');
    const waitingEl = document.getElementById('statWaiting');
    const priorityEl = document.getElementById('statPriority');
    const statusEl = document.getElementById('statStatus');

    if (totalEl) totalEl.textContent = total;
    if (waitingEl) waitingEl.textContent = waiting;
    if (priorityEl) priorityEl.textContent = priority;
    if (statusEl) statusEl.textContent = total ? 'Active' : 'Idle';
}

function statusBadge(status) {
    if (status === 'Waiting') {
        return `<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"><span class="h-1.5 w-1.5 rounded-full bg-amber-600"></span>${status}</span>`;
    }

    if (status === 'Serving' || status === 'Approved') {
        return `<span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"><span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>${status}</span>`;
    }

    if (status === 'Skipped' || status === 'Forwarded') {
        return `<span class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"><span class="h-1.5 w-1.5 rounded-full bg-red-600"></span>${status}</span>`;
    }

    return `<span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"><span class="h-1.5 w-1.5 rounded-full bg-gray-500"></span>${status || 'Pending'}</span>`;
}

function renderClientTable() {
    const tbody = document.getElementById('clientTablebody');
    if (!tbody) return;

    const totalPages = Math.max(1, Math.ceil(allClient.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = allClient.slice(startIndex, startIndex + pageSize);

    if (!pageItems.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No registered client yet. When the kiosk registers a client, it will appear here automatically.</td></tr>`;
        updateSummaryStats();
        return;
    }

    tbody.innerHTML = pageItems.map(client => `
        <tr data-id="${client.id}" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${client.queue_no ?? '---'}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">${initials(client.full_name)}</span>
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">${client.full_name || 'Unknown Client'}</p>
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400">${client.contact_number || 'No contact'}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${client.lane === 'Priority' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}">
                    ${client.lane || 'Regular'}
                </span>
            </td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${client.transaction_type || 'General'}</td>
            <td class="px-4 py-3">${statusBadge(client.status || 'Waiting')}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">${client.organization || 'Personal'}</td>
            <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                    <button type="button" title="View details" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"/><circle cx="12" cy="12" r="2.25"/></svg>
                    </button>
                    <button type="button" title="Process" class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updateSummaryStats();
}

async function loadClients() {
    try {
        const response = await fetch('/account/api/clients/', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Unable to load clients');
        }

        allClient = Array.isArray(data.clients) ? data.clients : [];
        renderClientTable();
    } catch (error) {
        const tbody = document.getElementById('clientTablebody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-sm text-red-500 dark:text-red-400">${error.message}</td></tr>`;
        }
    }
}

function notifyNavbarBell(clientName) {
    const badge = document.getElementById('notify');
    const toast = document.getElementById('transactionNotification');
    const clientLabel = clientName || 'New client';

    if (badge) {
        const currentCount = Number(badge.textContent || '0');
        const nextCount = Math.max(1, currentCount + 1);
        badge.textContent = String(nextCount);
        badge.style.display = 'inline-flex';
    }

    if (toast) {
        toast.textContent = `Bag-ong client: ${clientLabel}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    if (window.fetchPACDNotifications) {
        window.fetchPACDNotifications();
    }
}

function connectQueueSocket() {
    if (!('WebSocket' in window)) return;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socket = new WebSocket(protocol + window.location.host + '/ws/queue/');

    socket.onmessage = function (event) {
        const payload = JSON.parse(event.data);
        if (payload.action === 'queue_update') {
            const client = payload.client || {};
            const clientName = client.name || 'Unknown client';

            notifyNavbarBell(clientName);
            loadClients();
        }
    };

    socket.onclose = function () {
        setTimeout(connectQueueSocket, 3000);
    };
}

(function init() {
    loadClients();
    connectQueueSocket();
    updateSummaryStats();
})();


