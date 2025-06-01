const {
    pacdDashboard, resolvedClient, transactionCount,
    pendingClientsUrl, pacdReports, fetchCateredTransactionsUrl, displayQueUrl, fetchResolvedDataUnitUrl,
    forwardedClientUrl, csrfToken
} = window.dashboardConfig;

const path = window.location.pathname;
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function divisionUnitSelect(divisionID, unitID) {
    const divisionSelect = document.getElementById(divisionID);
    const unitSelect = document.getElementById(unitID);

    const unitOptions = {
        'MSD': ['HRMDU', 'Cashier', 'Finance'],
        'LHSD': ['MAIP', 'LHS Chief', 'Pharmacy'],
        'RD/ARD': ['Research', 'Legal', 'PACD', 'RD', 'ARD'],
        'RLED': ['RLED'],
        'SUPER': ['Super Admin'],
    };

    if (!divisionSelect || !unitSelect) return;

    divisionSelect.addEventListener("change", function () {
        const selectedDivision = divisionSelect.value;
        const units = unitOptions[selectedDivision] || [];

        // Clear existing options
        unitSelect.innerHTML = "";

        // Add a placeholder option
        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Select Unit";
        placeholderOption.value = "";
        unitSelect.appendChild(placeholderOption);

        // Populate new options
        units.forEach(unit => {
            const option = document.createElement("option");
            option.textContent = unit;
            option.value = unit;
            unitSelect.appendChild(option);
        });
    });
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

        function addClientRow(client, color) {
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars" title="Male"></i>'
                : '<i class="female-icon fa fa-venus" title="Female"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>#CT${client.client_id}-${client.client_queue_no}</td>
                <td> ${client.client_fullname}</td>
                <td style="align-items: center">${genderIcon}</td>
                <td> ${client.client_lane_type}</span></td>
                <td>
                    <button class="resolve-btn" title="Resolved" onclick='approveModal("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}", "${client.client_id}")'>
                        <i class="fa fa-check-circle"></i>
                    </button>
                    <button class="forward-btn" title="Forward" onclick="forwardedModal('${client.client_fullname}', '${client.client_transaction_type}', '${client.client_queue_no}', '${client.client_id}')">
                        <i class="fa fa-arrow-right"></i>
                    </button>
                    
                        <button class="skipped-btn" title="Skipped" onclick="skipClient('${client.client_id}')">
                            <i class="fa fa-remove"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        }
        divisionUnitSelect('f-division-select', 'f-unit-select');
        priorityClients.forEach(client => addClientRow(client));
        regularClients.forEach(client => addClientRow(client));
    })
}

function fetchAllResolvedClient() {
    fetch(resolvedClient, {
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
                <td>${client.action_type}</td>
                <td>${client.status}</td>
                <td>
                <button class="repeat-btn" title="Repeat" onclick="forwardedModal('${client.client_fullname}', '${client.client_transaction_type}', '${client.client_queue_no}', '${client.client_id}')">
                    <i class="fa fa-repeat"></i>
                    </button>
                <button class="view-btn" title="View" onclick="viewClientCatered()">
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

function fetchCateredTransactions() {
    fetch(fetchCateredTransactionsUrl, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#cateredTransactions');
      tableBody.innerHTML = '';
  
      data.resolved_clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${client.client_id}</td>
          <td>${client.client_queue_no}</td>
          <td>${client.client_fullname}</td>
          <td>${client.divisions}</td>
          <td>${client.unit}</td>
          <td>${client.status}</td>
          <td>${formatDateTime(client.date_resolved)}</td>
        `;
        tableBody.appendChild(row);
      });
    })
  }
  
// ---------- Fetch Forwarded Clients Display on PACD -- FIXED ---------
function fetchForwardedClientPACD() {
    fetch(forwardedClientUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#forwardedTransactions tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.forwarded_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.forwarded_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const name = String(client.client_fullname || '').trim();
            const initial = name.charAt(0).toUpperCase();
            
            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>${client.client_id}</td>
                <td>
                    <div class="client-info">
                        <div class="initial-circle">${initial}</div>    
                        <span>${client.client_fullname}</span>
                    </div>
                </td>
                <td>${client.client_queue_no}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
                <td>
                    <button class="action-button1 delete-button" title="Edit" 
                    onclick="forwardedEditModal(
                    ${client.client_id}, 
                    '${client.client_fullname}', 
                    '${client.client_division}', 
                    '${client.client_unit}', 
                    ${client.client_queue_no}, 
                    '${client.client_transaction_type}', 
                    '${client.client_transaction_details}')">
                    <i class="fa fa-edit"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        }
        divisionUnitSelect('e-division-select', 'e-unit-select');
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}


function fetchForwardedClientPACDDisplay() {
    fetch(forwardedClientUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#forwardedTransactions tbody');
        tableBody.innerHTML = '';

        let priorityClients = data.forwarded_clients.filter(client => client.client_lane_type === 'Priority');
        let regularClients = data.forwarded_clients.filter(client => client.client_lane_type !== 'Priority');

        function addClientRow(client, color) {
            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td>${client.client_queue_no}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}


function fetchTransactionCounts() {
  fetch(transactionCount, {
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
  })
  .catch(error => {
    console.error('Error fetching transaction counts:', error);
  });
}


if (path.includes(pacdDashboard)) {
    fetchForwardedClientPACD();
    fetchPendingClients();
    fetchAllResolvedClient();
    fetchTransactionCounts();
    setInterval(fetchTransactionCounts, 2000);
    // setInterval(fetchAllResolvedClient, 2000);
    // setInterval(fetchForwardedClientPACD, 2000);
    // setInterval(fetchPendingClients, 2000);
}

if (path.includes(displayQueUrl)) {
    fetchForwardedClientPACDDisplay()
    setInterval(fetchForwardedClientPACDDisplay, 3000);
}

if (path.includes(pacdReports)) {
    fetchCateredTransactions();
    setInterval(fetchCateredTransactions, 3000); 
}


