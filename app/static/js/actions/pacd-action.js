const {
    updateClientStatusServedUrl, forwardedClientToUnit, skippedClient,
    saveUpdateForwardedClientUrl,
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

function accountEdit(id, fname, lname, position, division, unit, user, password, email, contact, status) {
    selectedAccount = id;
    document.getElementById('f-name').value = fname;
    document.getElementById('l-name').value = lname;
    document.getElementById('edit-position').innerText = position;
    document.getElementById('edit-division').innerText = division;
    document.getElementById('edit-unit').innerText = unit;
    document.getElementById('edit-user').value = user;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-password').value = password;
    document.getElementById('edit-contact').value = contact;
    document.getElementById('edit-status').innerText = status;
    document.getElementById('editAccount').style.display = 'flex';
}

function closeEditAccount() {
    document.getElementById('editAccount').style.display = 'none';
}

function saveUpdateUser() {
    first_name = document.getElementById('f-name').value
    last_name = document.getElementById('l-name').value
    position = document.getElementById('e-account-position').value
    division = document.getElementById('e-account-division-select').value
    unit = document.getElementById('e-account-unit-select').value
    user = document.getElementById('edit-user').value
    email = document.getElementById('edit-email').value
    password = document.getElementById('edit-password').value
    contact = document.getElementById('edit-contact').value
    status = document.getElementById('edit-status').value
    console.log(first_name)
    fetch(updateDetails, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `account_id=${selectedAccount}&first_name=${first_name}&last_name=${last_name}&position=${position}&division=${division}&unit=${unit}&user=${user}&email=${email}`

    })
    .then(response => response.json())
    .then(() => {
        
        alert('update complete !!!');
        fetchAccountList();
        closeEditAccount();   
    })
}

function closeViewDetails () {
    document.getElementById('view-details-modal').style.display = 'none';
}

