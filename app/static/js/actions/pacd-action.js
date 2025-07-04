const {
    updateClientStatusServedUrl, forwardedClientToUnit, skippedClient,
    saveUpdateForwardedClientUrl, reports,
    updateDetails
} = window.dashboardConfig;

let selectedClient = null;

function skipClient(id) {
    selectedClient = id;
    if (confirm('Are you sure you want to skip this client?')) {
        fetch(skippedClient, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: `client_id=${selectedClient}`
        })
        .then(response => response.json())
        .then(() => {
            alert('Client skipped successfully!');
        })
        .catch(error => console.error('Error skipping client:', error));
    } else {
        return;
    }
    fetchPendingClients();
}

// approved from pacd
function closedApproved() {
    document.getElementById('approvedClient').style.display = 'none';
}

function approveModal(client, que, id) {
    selectedClient = id;
    document.getElementById('approve-client-id').innerText = id;
    document.getElementById('approve-client-que').innerText = que;
    document.getElementById('approve-client-fullname').innerText = client;
    document.getElementById('approved-remarks').value = '';
    document.getElementById('csm-checkbox').checked = false;
    document.getElementById('css-checkbox').checked = false;
    document.getElementById('approvedClient').style.display = 'flex';
}

function forwardedModal(client, que, id) {
    selectedClient = id;
    document.getElementById('forward-fullname').innerText = client;
    document.getElementById('f-client-que').innerText = que;
    document.getElementById('forwardClient').style.display = 'flex';
}

function closeForward() {
    document.getElementById('forwardClient').style.display = 'none';
    selectedClient = null;
}
function saveForwardedClient() {
    const transaction_type = document.getElementById('f-transaction-type').value;
    const org_name = document.getElementById('f-org-name').value;
    const transaction_details = document.getElementById('forwarded-transactions-details').value;
    const division = document.getElementById('f-division-select').value;
    const unit = document.getElementById('f-unit-select').value;

    fetch(forwardedClientToUnit, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&org_name=${org_name}&transaction_type=${transaction_type}&transaction_details=${transaction_details}&division=${division}&unit=${unit}&action_type=forwarded`
    })
    .then(response => response.json())
    .then(() => {
        alert('forwarded the client!!');
        closeForward();   
    })
}
function closeViewDetails () {
    document.getElementById('view-details-modal').style.display = 'none';
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
        closedApproved();
    })
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
