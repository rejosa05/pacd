const {
    unitDashboard, transactionHistoryUnit
} = window.dashboardConfig;

function fetchAllServedClientUnit() {
    fetch(transactionHistoryUnit, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#transactionHistoryAll tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.resolved_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.resolved_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>#CT${client.client_id}-${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
                <td>${client.status}</td>
                <td>${formatDateTime(client.date_served)}</td>
                <td>
                <button class="view-btn" title="View" onclick="viewClientDetails('${client.id}')">
                    <i class="fa fa-list"></i>
                </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client));
        regularClients.forEach(client => addClientRow(client));
    })
}

if (path.includes(unitDashboard)) {
    fetchAllServedClientUnit();
    // setInterval(fetchAllServedClient, 3000);
}
