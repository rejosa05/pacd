const {
    unitTransactions, unitPendingUrl, unitResolved
} = window.dashboardConfig;

function unitPendingList() {
    fetch (unitPendingUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#forwardedClient tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.forwarded_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.forwarded_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {                
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars"></i>'
                : '<i class="female-icon fa fa-venus"></i>';

            const laneType = client.client_lane_type === 'Priority' ? 'priority-cell' : 'regular-cell';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>#CT${client.client_id}-${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td style="align-items: center">${genderIcon}</td>
                <td class="${laneType}">${client.client_lane_type}</td>
                <td>
                    <button class="resolve-btn" title="Resolved" onclick='approvedUnit("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}", "${client.client_id}", "${client.client_transaction_details}")'>
                            <i class="fa fa-check-circle"></i>
                    </button>                 
                    <button class="skipped-btn" title="Skipped" onclick="skipClient('${client.client_id}')">
                        <i class="fa fa-remove"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client));
        regularClients.forEach(client => addClientRow(client));
    })
}

function fetchAllResolvedClientUnit() {
    fetch(unitResolved, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#cateredTransactions tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.resolved_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.resolved_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>#CT${client.client_id}-${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td>${client.status}</td>
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

if (path.includes(unitTransactions)) {
    unitPendingList();
    fetchAllResolvedClientUnit();
    setInterval(unitPendingList, 3000);
    setInterval(fetchAllResolvedClientUnit, 3000)
}