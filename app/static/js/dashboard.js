const {
    dashboardUrl, resolvedClientsUrl, accountListUrl, accountUrl,
    pendingClientsUrl, pacdReports, fetchCateredTransactionsUrl, unitDashboadUrl, displayQueUrl, fetchResolvedDataUnitUrl,
    forwardedPendingClientUrl, unitDashboard, pacdDashboard, fetchResolvedDataUrl, csrfToken
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

// ---------- Queue Display (PACD Dashboard) -- FIXED ----------
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

// ----- ACCOUNTS -----
function fetchAccountList() {
    fetch(accountListUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
    .then(data => {
        const tableBody = document.querySelector('#accountList tbody');
        tableBody.innerHTML = '';

        data.accountList.forEach(account => {
            const f_ = String(account.first_name || '').trim();
            const l_ = String(account.last_name || '').trim();
            const fInitial = f_.charAt(0).toUpperCase();
            const lInitial = l_.charAt(0).toUpperCase();
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${account.id}</td>
            <td>
                <div class="client-info">
                    <div class="initial-circle">${fInitial}${lInitial}</div>    
                    <span>${account.first_name} ${account.last_name}</span>
                </div>
            </td>
            <td>${account.position}</td>
            <td>${account.divisions}</td>
            <td>${account.unit}</td>
            <td>${account.user}</td>
            <td>${account.email}</td>
            <td>
                <button class="action-button1" title="Edit"><i class="fa fa-edit"></i></button>
            </td>
            `;
            tableBody.appendChild(row);
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
                ? '<i class="male-icon fa fa-mars"></i>'
                : '<i class="female-icon fa fa-venus"></i>';

            const laneTypeIcon = client.client_lane_type === 'Regular'
                ? '<i class="regular fa fa-angle-double-down"></i>'
                : '<i class="priority fa fa-angle-double-up"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td><i class='badge fa fa-id-badge'></i> ${client.client_id}</td>
                <td> ${client.client_queue_no}</td>
                <td><i class='person fa fa-user'></i> ${client.client_fullname}</td>
                <td class="gender-cell">${genderIcon} &nbsp; <span class="gender-text"> ${client.client_gender}</span></td>
                <td>${laneTypeIcon} &nbsp; <span>${client.client_lane_type}</span></td>
                <td class="actions-cell">
                    <div class="actions-container">
                        <button class="action-button1 update-button" title="Forward" onclick="forwardedModal('${client.client_fullname}', '${client.client_transaction_type}', '${client.client_queue_no}', '${client.client_id}')">
                            <i class="fa fa-arrow-right"></i>
                        </button>
                        <button class="action-button1 approved-button" title="Resolved" onclick='approveModal("${client.client_fullname}","${client.client_transaction_type}", "${client.client_queue_no}", "${client.client_id}")'>
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
        divisionUnitSelect('f-division-select', 'f-unit-select');
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

function fetchAllResolvedClient() {
    fetch(fetchResolvedDataUrl, {
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
                <td>${client.client_lane_type}</td>
                <td>${client.status}</td>
                <td><button></button></td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
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
    fetch(forwardedPendingClientUrl, {
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
                    <button class="action-button1 delete-button" 
                    title="Edit" onclick="forwardedEditModal(
                    '${client.client_id}', 
                    '${client.client_fullname}', 
                    '${client.client_division}',
                    '${client.client_unit}',
                    '${client.client_queue_no}',
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
// ---------- UNIT DASHBOARD ACTION ------------
// ---------- Unit Dashboard ---------
function fetchForwardedClient() {
    fetch (unitDashboadUrl, {
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

function fetchForwardedClientPACDDisplay() {
    fetch(forwardedPendingClientUrl, {
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
function fetchAllResolvedClientUnit() {
    fetch(fetchResolvedDataUnitUrl, {
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
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

// -------- DISPLAY PAGE ---------

function fetchPendingClientsDisplay() {
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
            const laneTypeIcon = client.client_lane_type === 'Regular'
                ? '<i class="regular fa fa-angle-double-down"></i>'
                : '<i class="priority fa fa-angle-double-up"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                <td> ${client.client_queue_no}</td>
                <td>${laneTypeIcon} &nbsp; <span>${client.client_lane_type}</span></td>
                <td>${client.client_transaction_type}</td>
            `;
            tableBody.appendChild(row);
        }
        
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
}

if (path.includes(pacdDashboard)) {
    fetchForwardedClientPACD();
    fetchPendingClients();
    fetchAllResolvedClient();
    fetchQuePacdDashboard();
    setInterval(fetchAllResolvedClient, 3000);
    setInterval(fetchForwardedClientPACD, 3000);
    setInterval(fetchPendingClients, 3000);
    setInterval(fetchQuePacdDashboard, 3000);
}

if (path.includes(unitDashboard)) {
    fetchForwardedClient();
    fetchAllResolvedClientUnit();
    setInterval(fetchForwardedClient, 3000);
    setInterval(fetchAllResolvedClientUnit, 3000)
}

if (path.includes(displayQueUrl)) {
    fetchQuePacdDashboard()
    fetchPendingClientsDisplay()
    fetchForwardedClientPACDDisplay()
    setInterval(fetchForwardedClientPACDDisplay, 3000);
    setInterval(fetchPendingClientsDisplay, 3000);
    setInterval(fetchQuePacdDashboard, 3000);
}

if (path.includes(pacdReports)) {
    fetchCateredTransactions();
    setInterval(fetchCateredTransactions, 3000); 
}

if (path.includes(accountUrl)) {
    fetchAccountList();
    setInterval(fetchAccountList, 3000);
}
