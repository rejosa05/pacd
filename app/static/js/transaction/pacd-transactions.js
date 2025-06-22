const {
    pacdTransactions, transactionHistory, transactionCount, viewCLient,
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
                <td>#CT${client.client_id}</td>
                <td> ${client.client_fullname}</td>
                <td style="align-items: center">${genderIcon}</td>
                <td> ${client.client_lane_type}</span></td>
                <td>
                    <button class="resolve-btn" title="Resolved" onclick='approveModal("${client.client_fullname}", "${client.client_queue_no}", "${client.client_id}")'>
                        <i class="fa fa-check-circle"></i>
                    </button>
                    <button class="forward-btn" title="Forward" onclick="forwardedModal('${client.client_fullname}', '${client.client_queue_no}', '${client.client_id}')">
                        <i class="fa fa-mail-forward"></i>
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
    fetch(transactionHistory, {
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
                <td>${client.client_division}</td>
                <td>${client.client_unit}</td>
                <td>${client.status}</td>
                <td>
                <button class="repeat-btn" title="Repeat" onclick="forwardedModal('${client.client_fullname}', '${client.client_queue_no}', '${client.client_id}')">
                    <i class="fa fa-repeat"></i>
                    </button>
                <button class="view-btn" title="View" onclick="viewClientDetails('${client.id}')">
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
    document.getElementById('count-pending').textContent = counts['Pending'] || 0;
    document.getElementById('count-completed').textContent = counts['Completed'] || 0;
  })
  .catch(error => {
    console.error('Error fetching transaction counts:', error);
  });
}

function viewClientDetails(id) {
    fetch(`${viewCLient}${id}/`)
        .then(response => {
            if (!response.ok) throw new Error('Client not found');
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
                <dt>Forms:</dt><dd>${client.client_form}</dd>
                <dt>Employee Catered:</dt><dd>${client.client_user}</dd>
            `;
            detailsOverlay.style.display = 'flex';
            modal.focus();
        })
}

function saveApprovedClientByPACD() {
    const org_name = document.getElementById('a-org-name').value;
    const transaction_type = document.getElementById('a-transaction-type').value;
    const transaction_details = document.getElementById('approved-transactions-details');
    const remarks = document.getElementById('approved-remarks');
    const csmChecked = document.getElementById('csm-checkbox');
    const cssChecked = document.getElementById('css-checkbox');

    if (!transaction_details.value || !remarks.value) { 
        alert('please do not leave blanks !!!');
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
        body: `client_id=${selectedClient}&org_name=${org_name}&transactions_type=${transaction_type}&transaction_details=${transaction_details.value}&remarks=${remarks.value}&resolutions=${resolutions}`
    })
    .then(response => response.json())
    .then(() => {
        alert('succefully catered!!!')
        fetchPendingClients();
        closedApproved();
    })
}


if (path.includes(pacdTransactions)) {
    fetchPendingClients();
    fetchAllResolvedClient();
    fetchTransactionCounts();
    setInterval(fetchTransactionCounts, 2000);
    setInterval(fetchAllResolvedClient, 2000);
    setInterval(fetchPendingClients, 2000);
}