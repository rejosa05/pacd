const {
    skippedClientUnit, updateCLientStatusServedUnitUrl
} = window.dashboardConfig;

function skipClientUnit(id) {
    selectedClient = id;
    if (confirm('Are you sure you want to skip this client?')) {
        fetch(skippedClientUnit, {
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

function approvedUnitClose() {
    document.getElementById('approvedClient-unit').style.display = 'none';
}
function approvedUnit(name, type, id, cid, details, ticket, contact) {
    selectedClient = cid;
    document.getElementById('client-ticket').innerText = ticket;
    document.getElementById('client-id').innerText = id;
    document.getElementById('client-fullname').innerText = name;
    document.getElementById('client-contact').innerText = contact;
    document.getElementById('unit-transaction-type').innerText = type;
    document.getElementById('unit-transactions-details').innerText = details;
    document.getElementById('approvedClient-unit').style.display = 'flex';
}

function saveActionResolved() {
    const srvc_avail = document.getElementById('serviceList').value;
    const remarks = document.getElementById('unit-approved-remarks');
    const deficiencies = document.getElementById('deficiencies-textarea');
    const csmChecked = document.getElementById('unit-csm-checkbox').checked;
    const cssChecked = document.getElementById('unit-css-checkbox').checked;

    const charterCoveredRadio = document.querySelector('input[name="cc-cover"]:checked');
    const charterCoveredValue = charterCoveredRadio ? charterCoveredRadio.value : null;

    const requirementsRadio = document.querySelector('input[name="requirements"]:checked');
    const requirementsValue = requirementsRadio ? requirementsRadio.value : null;

    if (!remarks.value.trim()) { 
        alert('please do not leave blanks !!!');
        return;
    }
    
    if ((csmChecked && cssChecked) || (!csmChecked && !cssChecked)) {
        alert('Please select only one satisfaction form (CSM or CSS)!');
        return;
    }

    const resolutions = isCSM ? 'CSM' : 'CSS';

    let deficienciesValue = '';
    if (requirementsValue === 'Yes') {
        deficienciesValue = deficienciesTextarea.value.trim();
    } else {
        deficienciesValue = '';
    }

    fetch(updateCLientStatusServedUnitUrl, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken,
        },
        body: `selectedClient=${selectedClient}&remarks=${remarks.value}&resolutions=${resolutions}&srvc_avail=${srvc_avail}&cc_cover=${charterCoveredValue}&requiremnets_met=${requirementsValue}&deficiencies=${deficiencies.value}`
    })
    .then(response => response.json())
    .then(() => {
        alert('succefully catered!!!')
        approvedUnitClose();
        fetchTransactions();
    })
}
