const {
    dashboardUrl, resolvedClientsUrl, updateDivisionLogUrl,
    pendingClientsUrl, updateClientStatusServedUrl,
    updateClientStatusForwardedUrl, unitDashboadUrl, csrfToken
} = window.dashboardConfig;

let selectedClient = null;

// ---------- Fetch and Update Resolved Clients Table ----------
function fetchResolvedData() {
    fetch(resolvedClientsUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const resolvedTableBody = document.querySelector('#resolvedQueueTable tbody');
        resolvedTableBody.innerHTML = ''; // Clear rows

        data.resolved_clients.forEach(client => {
            const row = document.createElement('tr');
            const formattedDate = new Date(client.date_resolved).toLocaleDateString();

            row.innerHTML = `
                <td>${client.client_id__client_queue_no}</td>
                <td>${client.client_id__client_fullname}</td>
                <td>${client.client_id__client_gender}</td>
                <td>${client.client_id__client_lane_type}</td>
                <td>${client.remarks}</td>
                <td>${client.form}</td>
                <td>${client.unit_user}</td>
                <td>${formattedDate}</td>
            `;
            resolvedTableBody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching resolved clients:', error));
}

// ---------- Fetch and Update Queue Display (PACD Dashboard) ----------
function fetchQuePacdDashboard() {
    fetch(dashboardUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        document.getElementById('regularCurrent').innerText = data.regular_lane.client_queue_no || "00";
        document.getElementById('fastCurrent').innerText = data.priority_lane.client_queue_no || "00";
    })
    .catch(error => console.error('Error fetching dashboard queue:', error));
}

// ---------- Fetch and Display Pending Clients ----------
function fetchPendingClients() {
    fetch(pendingClientsUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#pendingClientQueueTable tbody');
        tableBody.innerHTML = ''; // Clear old rows

        let priorityClients = data.pending_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.pending_clients.filter(client => client.client_lane_type !== 'Priority');

        console.log(data.pending_clients)

        function addClientRow(client, color) {
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars"></i>'
                : '<i class="female-icon fa fa-venus"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td class="gender-cell">${genderIcon}<span class="gender-text"> ${client.client_gender}</span></td>
                <td>${client.client_lane_type}</td>
                <td class="actions-cell">
                    <div class="actions-container">
                        <button class="action-button1 update-button" title="Forward" onclick="forwardedModal('${client.client_fullname}', '${client.client_transaction_type}', '${client.client_queue_no}', '${client.client_id}')">
                            <i class="fa fa-arrow-right"></i>
                        </button>
                        <button class="action-button1 approved-button" title="Resolved" onclick='approveModal("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}")'>
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

        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 0, 0, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(0, 255, 0, 0.3)'));
    })
    .catch(error => console.error('Error fetching pending clients:', error));
}
// ---------- Unit Dashboard ---------
function fetchForwardedClient() {
    fetch (unitDashboadUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#forwardedClient tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.forwarded_clients.filter(client => client.client_id__client_lane_type === 'Priority');
        let regularClients = data.forwarded_clients.filter(client => client.client_id__client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars"></i>'
                : '<i class="female-icon fa fa-venus"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>${client.client_id__client_lane_type}</td>
                <td>${client.client_fullname}</td>
                <td class="gender-cell">${genderIcon}<span class="gender-text"> ${client.client_gender}</span></td>
                <td>${client.client_lane_type}</td>
                <td class="actions-cell">
                    <div class="actions-container">
                        <button class="action-button1 approved-button" title="Resolved" onclick='approveModal("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}")'>
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
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 0, 0, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(0, 255, 0, 0.3)'));
    })
    .catch(error => console.error('Error fetching pending clients:', error));
}

// ---------- Approve Modal ----------
function approveModal(client, details, ques) {
    selectedClient = client;
    document.getElementById('modal-fullname').innerText = client;
    document.getElementById('modal-transaction').innerText = details;
    document.getElementById('modal-queue-no').innerText = ques;
    document.getElementById('modal-remarks').value = '';
    document.getElementById('csm-checkbox').checked = false;
    document.getElementById('css-checkbox').checked = false;
    document.getElementById('approvedModal').style.display = 'flex';
}
function closedApprovedModal() {
    document.getElementById('approvedModal').style.display = 'none';
    selectedClient = null;
}
function saveApprovedClient() {
    const remarks = document.getElementById('modal-remarks').value;
    const details = document.getElementById('modal-transaction-details').value;
    const csmChecked = document.getElementById('csm-checkbox').checked;
    const cssChecked = document.getElementById('css-checkbox').checked;

    fetch(updateClientStatusServedUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient.client_id}`
    })
    .then(response => response.json())
    .then(() => {
        return fetch(updateDivisionLogUrl, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: `client_id=${selectedClient.client_id}&transaction_details=${details}&remarks=${remarks}&csm=${csmChecked}&css=${cssChecked}&action_type=approved`
        });
    })
    .then(response => response.json())
    .then(() => {
        fetchResolvedData();
        fetchPendingClients();
    })
    .catch(error => console.error('Error saving approved client:', error));

    closedApprovedModal();
}

// ---------- Forwarded Modal ----------
function forwardedModal(client, type, que, id) {
    selectedClient = id;
    document.getElementById('client-id').innerText = selectedClient;
    document.getElementById('modal-forwarded-fullname').innerText = client;
    document.getElementById('modal-forwarded-transaction-type').innerText = type || 'N/A';
    document.getElementById('modal-forwarded-queue-no').innerText = que;
    document.getElementById('forwardedModal').style.display = 'flex';
}
function closedForwardedModal() {
    document.getElementById('forwardedModal').style.display = 'none';
    selectedClient = null;
}
function saveForwardedClient() {
    const transaction_details = document.getElementById('modal-forwarded-transactions-details').value;
    const division = document.getElementById('division-select').value;
    const unit = document.getElementById('unit-select').value;

    fetch(updateClientStatusForwardedUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&transaction_details=${transaction_details}&division=${division}&unit=${unit}&action_type=forwarded`
    })
    .then(response => response.json())
    .then(() => {
        fetchResolvedData();
        fetchPendingClients();
    })
    .catch(error => console.error('Error forwarding client:', error));

    closedForwardedModal();
}


fetchForwardedClient();
fetchPendingClients();
fetchResolvedData();
fetchQuePacdDashboard();

setInterval(fetchForwardedClient, 5000);
setInterval(fetchPendingClients, 5000);
setInterval(fetchResolvedData, 5000);
setInterval(fetchQuePacdDashboard, 5000);
