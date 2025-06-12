const {
    unitTransactions, unitPendingUrl, unitResolved, viewCLientUnit, transactionCountUnit
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
                <td>#CT${client.client_id}</td>
                <td>${client.client_fullname}</td>
                <td>${client.status}</td>
                <td>
                <button class="view-btn" title="View" onclick="viewClientUnitDetails('${client.id}')">
                    <i class="fa fa-eye"></i>
                </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client));
        regularClients.forEach(client => addClientRow(client));
    })
}

function fetchTransactionCountsUnit() {
  fetch(transactionCountUnit, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    const counts = data.type_count;
    document.getElementById('count-inquiry').textContent = counts['Inquiry'] || 0;
    document.getElementById('count-request').textContent = counts['Request'] || 0;
    document.getElementById('count-submit').textContent = counts['Submit Documents'] || 0;
    document.getElementById('count-others').textContent = counts['Others'] || 0;
    document.getElementById('count-pending').textContent = counts['Pending'] || 0;
    document.getElementById('count-completed').textContent = counts['Completed'] || 0;
  })
  .catch(error => {
    console.error('Error fetching transaction counts:', error);
  });
}

function viewClientUnitDetails(id) {
    fetch(`${viewCLientUnit}${id}/`)
        .then(response => {
            if (!response.ok) throw new Error('Account not found');
            return response.json();
        })
        
        .then(client => {
            const userDetailsList = document.getElementById('client-details-list');
            const detailsOverlay = document.getElementById('view-details-modal');
            const modal = detailsOverlay.querySelector('.modal-view');

            userDetailsList.innerHTML = `
                <dt>Client ID:</dt><dd> #CT${client.client_id}</dd>
                <dt>Full Name:</dt><dd>${client.client_fullname}</dd>
                <dt>Company/Org Name:</dt><dd>${client.client_org}</dd>
                <dt>Gender:</dt><dd>${client.client_gender}</dd>
                <dt>Lane Type:</dt><dd>${client.client_lane_type}</dd>
                <dt>Transaction Type:</dt><dd>${client.client_transaction_type}</dd>
                <dt>Transaction Details:</dt><dd>${client.client_transaction_details}</dd>
                <dt>Division:</dt><dd>${client.client_division}</dd>
                <dt>Unit:</dt><dd>${client.client_unit}</dd>
                <dt>Status:</dt><dd>${client.client_status}</dd>
                <dt>Date Created:</dt><dd>${formatDateTime(client.client_created)}</dd>
                <dt>Date Forwarded:</dt><dd>${formatDateTime(client.client_forwarded)}</dd>
                <dt>Date Resolved:</dt><dd>${formatDateTime(client.client_resolved)}</dd>
                <dt>Remarks:</dt><dd>${client.client_remarks}</dd>
                <dt>Employee Catered:</dt><dd>${client.client_user}</dd>
            `;
            detailsOverlay.style.display = 'flex';
            modal.focus();
        })
}

if (path.includes(unitTransactions)) {
    fetchTransactionCountsUnit();
    unitPendingList();
    fetchAllResolvedClientUnit();
    setInterval(unitPendingList, 3000);
    setInterval(fetchAllResolvedClientUnit, 3000)
    setInterval(fetchTransactionCountsUnit, 3000)
}