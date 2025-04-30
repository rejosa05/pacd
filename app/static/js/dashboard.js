const {
    dashboardUrl, resolvedClientsUrl, updateDivisionLogUrl,
    pendingClientsUrl, updateClientStatusServedUrl, pacdReports, fetchCateredTransactionsUrl,
    updateClientStatusForwardedUrl, unitDashboadUrl, displayQueUrl, fetchResolvedDataUnitUrl,
    forwardedPendingClientUrl, unitDashboard, pacdDashboard, fetchResolvedDataUrl, csrfToken
} = window.dashboardConfig;

const path = window.location.pathname;

let selectedClient = null;

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

function divisionUnitSelect(divisionId = "division-select", unitId = "unit-select") {
    const divisionSelect = document.getElementById(divisionId);
    const unitSelect = document.getElementById(unitId);

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
        divisionUnitSelect();
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
    .catch(error => console.error('Error fetching pending clients:', error));
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
                <td>${client.client_queue_no}</td>
                <td>${client.client_fullname}</td>
                <td>${client.client_lane_type}</td>
                <td>${client.status}</td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
    .catch(error => console.error('Error fetching resolved clients', error));
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
    .catch(error => console.error('Error fetching catered transactions:', error));
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
            const genderIcon = client.client_gender === 'Male'
                ? '<i class="male-icon fa fa-mars"></i>'
                : '<i class="female-icon fa fa-venus"></i>';

            const row = document.createElement('tr');
            row.style.backgroundColor = color;
            row.innerHTML = `
                
                <td>
                    <div class="client-info">
                        <div class="initial-circle">${initial}</div>    
                        <span>${client.client_fullname}</span>
                    </div>
                </td>
                <td>${client.client_queue_no}</td>
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
                <td><i class="fa fa-forwarded"></i>${client.client_a_type}</td>
            `;
            tableBody.appendChild(row);
        }
        priorityClients.forEach(client => addClientRow(client, 'rgba(255, 173, 173, 0.3)'));
        regularClients.forEach(client => addClientRow(client, 'rgba(130, 207, 255, 0.3)'));
    })
    .catch(error => console.error('Error fetching pending clients:', error));
}

// ---------- Approve Modal ----------
function approveModal(client, details, ques, id) {
    selectedClient = id;
    document.getElementById('modal-fullname-approved').innerText = client;
    document.getElementById('modal-transaction').innerText = details;
    document.getElementById('modal-queue-no-a').innerText = ques;
    document.getElementById('modal-remarks').value = '';
    document.getElementById('csm-checkbox').checked = false;
    document.getElementById('css-checkbox').checked = false;
    document.getElementById('approvedModal').style.display = 'flex';
}

function closedApprovedModal() {
    document.getElementById('approvedModal').style.display = 'none';
    selectedClient = null;
}

function saveApprovedClientByPACD() {
    const transaction_details = document.getElementById('modal-transaction-details');
    const remarks = document.getElementById('modal-remarks');
    const csmChecked = document.getElementById('csm-checkbox');
    const cssChecked = document.getElementById('css-checkbox');

    if (!transaction_details.value || !remarks.value) { 
        alert('please provide transaction details or remarks !!!');
        return;
    }
    
    const isCSM = csmChecked.checked;
    const isCSS = cssChecked.checked;

    if ((isCSM && isCSS) || (!isCSM && !isCSS)) {
        alert('Please select only one satisfaction form (CSM or CSS)!');
        return;
    }

    const resolutions = isCSM ? 'CSM' : 'CSS';

    fetch(updateClientStatusServedUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&transaction_details=${transaction_details.value}&remarks=${remarks.value}&resolutions=${resolutions}`
    })
    .then(response => response.json())
    .then(() => {
        fetchPendingClients();
        alert('succefully catered!!!')
        closedApprovedModal();
    })
    .catch(error => console.error('Error resolved client:', error));
}

// ----------- RESOLVED PACD CLIENT only ----------- 
// ---------- Forwarded Modal (Fixed) ----------
function forwardedModal(client, type, que, id) {
    selectedClient = id;
    document.getElementById('client-id').innerText = selectedClient;
    document.getElementById('modal-fullname').innerText = client;
    document.getElementById('modal-transaction-type').innerText = type;
    document.getElementById('modal-queue-no').innerText = que;
    document.getElementById('openModal').style.display = 'flex';
    console.log(que);
}

function closeModal() {
    document.getElementById('openModal').style.display = 'none';
    document.getElementById('modal-forwarded-transactions-details').value = '';
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
        fetchPendingClients();
        alert('forwarded the client!!');
        closeModal();   
    })
    .catch(error => console.error('Error forwarding client:', error));
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
    .catch(error => console.error('Error fetching pending clients:', error));
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
    .catch(error => console.error('Error fetching pending clients:', error));
}

function openModalAction(client, details, que, id, type) {
    selectedClient = id;
    document.getElementById('client-id').innerText = selectedClient;
    document.getElementById('modal-fullname').innerText = client;
    document.getElementById('modal-transaction-type').innerText = type;
    document.getElementById('modal-transaction-details').innerText = details || 'N/A';
    document.getElementById('modal-queue-no').innerText = que;
    document.getElementById('openModal').style.display = 'flex';
}

function saveActionResolved() {
    const remarks = document.getElementById('modal-remarks').value;
    const csmChecked = document.getElementById('csm-checkbox');
    const cssChecked = document.getElementById('css-checkbox');

    let resolutions = '';

    if (csmChecked.checked) {
        resolutions = csmChecked.value;
    }
    else if (cssChecked.checked) {
        resolutions = cssChecked.value;
    }
        
    fetch(updateDivisionLogUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&remarks=${remarks}&resolution=${resolutions}`
    })
    .catch(error => console.error('Error saving approved client:', error));

    alert('done !!!')
    closeModal();
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
                <td>${client.client_queue_no}</td>
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
    .catch(error => console.error('Error fetching resolved clients', error));
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
    .catch(error => console.error('Error fetching pending clients:', error));
}

if (path.includes(pacdDashboard)) {
    fetchForwardedClientPACD();
    fetchPendingClients();
    fetchAllResolvedClient();
    fetchQuePacdDashboard();
    setInterval(fetchAllResolvedClient, 5000);
    setInterval(fetchForwardedClientPACD, 5000);
    setInterval(fetchPendingClients, 5000);
    setInterval(fetchQuePacdDashboard, 5000);
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
