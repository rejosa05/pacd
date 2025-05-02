const {
    updateClientStatusServedUrl, updateClientStatusForwardedUrl, updateDivisionLogUrl
} = window.dashboardConfig;

let selectedClient = null;

function closedApprovedModal() {
    document.getElementById('approvedModal').style.display = 'none';
    selectedClient = null;
}

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
        alert('succefully catered!!!')
        closedApprovedModal();
    })
    .catch(error => console.error('Error resolved client:', error));
}

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
        alert('forwarded the client!!');
        closeModal();   
    })
    .catch(error => console.error('Error forwarding client:', error));
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
