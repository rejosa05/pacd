const {
    unitDashboard, unitPendingUrl, unitResolved
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

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>${client.client_id}</td>
                <td>${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td class="gender-cell">${genderIcon}<span class="gender-text"> ${client.client_gender}</span></td>
                <td>${client.client_lane_type}</td>
                <td class="actions-cell">
                    <div class="actions-container">
                        <button class="action-button1 approved-button" title="Resolved" onclick='openModalAction("${client.client_fullname}","${client.transaction_details}", "${client.client_queue_no}","${client.client_id}", "${client.client_transaction_type}")'>
                            <i class="fa fa-check-circle"></i>
                        </button>
                        <button class="action-button1 delete-button" title="Skipped" onclick="skipClient('${client.client_fullname}', '${client.client_transaction_type}')">
                            <i class="fa fa-remove"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

function unitResolvedList() {
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
                <td>${client.client_id}</td>

                <td>${client.client_fullname}</td>
                <td>${client.client_gender}</td>
                <td>${client.client_lane_type}</td>
                <td>${client.status}</td>
                <td>${client.form}</td>
                <td>${client.unit_user}</td>
                <td>${formatDateTime(client.date_resolved)}</td>
                <td>
                    <button class="action-button1" title="View"><i class="fa fa-list"></i></button>
                    <button class="action-button1" title="Edit"><i class="fa fa-edit"></i></button>
                    
                </td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

if (path.includes(unitDashboard)) {
    unitPendingList();
    unitResolvedList();
    setInterval(unitPendingList, 3000);
    setInterval(unitResolvedList, 3000)
}