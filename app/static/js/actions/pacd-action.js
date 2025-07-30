const {
    updateClientStatusServedUrl, forwardedClientToUnit, skippedClient,
    saveUpdateForwardedClientUrl,
    updateDetails, repeatTransaction, servingClientUnit,
    getServices
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

        document.getElementById('f-transaction-type').value = '';
        document.getElementById('f-org-name').value = '';
        document.getElementById('forwarded-transactions-details').value = '';
        document.getElementById('f-division-select').value = '';
        document.getElementById('f-unit-select').value = '';
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


function openAddAccount() {
    document.getElementById('add-client').style.display = 'flex';
}

function closeAddAccount() {
    document.getElementById('add-client').style.display = 'none';
}

function saveAccount(){
    const division = document.getElementById('division-select').value;
    const unit = document.getElementById('unit-select').value;
    fetch(saveNewAccount, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
    })
    closeAddAccount();
}

// repeat transactions
function repeatTransactions(id, fname, que, org) {
    selectedClient = id;
    document.getElementById('r-fullname').innerText = fname;
    document.getElementById('r-client-que').innerText = que;
    document.getElementById('r-org').innerText = org;
    document.getElementById('repeatTransaction').style.display = 'flex';
}
function closeRepeat() {
    document.getElementById('repeatTransaction').style.display = 'none';
    selectedClient = null;
}

function saveRepeat() {
    const transaction_type = document.getElementById('r-transaction-type').value;
    const org_name = document.getElementById('f-org-name').value;
    const transaction_details = document.getElementById('r-transactions-details').value;
    const division = document.getElementById('r-division-select').value;
    const unit = document.getElementById('r-unit-select').value;

    fetch(repeatTransaction, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `client_id=${selectedClient}&org_name=${org_name}&transaction_type=${transaction_type}&transaction_details=${transaction_details}&division=${division}&unit=${unit}`
    })
    .then(response => response.json())
    .then(() => {
        alert('repeat transactions!!');
        closeRepeat();
    })   
}

// to served client
function servedClose() {
    document.getElementById('servedClient-unit').style.display = 'none';
}

function toServed(fullname, type, id, cid, details, division) {
    selectedClient = cid;
    cts_id = "#CTS-" + id;
    document.getElementById('to-served-client-id').innerText = selectedClient;
    document.getElementById('to-served-fullname').innerText = fullname;
    document.getElementById('to-served-trnsction-type').innerText = type;
    document.getElementById('to-served-trnsction-details').innerText = details;
    document.getElementById('servedClient-unit').style.display = 'flex';

    updateServiceOptionsForDivision(division);
}

function serving() {
    fetch(servingClientUnit, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `selectedClient=${selectedClient}`
    })
    .then(response => response.json())
    .then(() => {
        alert('now serving!!');
        servedClose();
    })   
}